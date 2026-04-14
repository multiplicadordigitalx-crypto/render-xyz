
import { GoogleGenAI } from "@google/genai";
import { RenderStyle, RenderResolution } from "../types";

export const MOCK_MODE = false;

const RESOLUTION_CONFIG: Record<RenderResolution, { targetWidth: number; scaleFactor: number }> = {
  '1K': { targetWidth: 1024, scaleFactor: 1 },
  '2K': { targetWidth: 2048, scaleFactor: 2 },
  '4K': { targetWidth: 4096, scaleFactor: 4 },
};

/**
 * Upscale an image using Canvas API with high-quality interpolation.
 * Uses progressive scaling (2x steps) for better quality on large upscales.
 */
const upscaleImage = (base64Data: string, scaleFactor: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let currentWidth = img.width;
      let currentHeight = img.height;
      const targetWidth = currentWidth * scaleFactor;
      const targetHeight = currentHeight * scaleFactor;

      // Progressive scaling: scale 2x at a time for better quality
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d')!;

      // Draw original first
      canvas.width = currentWidth;
      canvas.height = currentHeight;
      ctx.drawImage(img, 0, 0);

      while (currentWidth < targetWidth) {
        const nextWidth = Math.min(currentWidth * 2, targetWidth);
        const nextHeight = Math.min(currentHeight * 2, targetHeight);

        const stepCanvas = document.createElement('canvas');
        stepCanvas.width = nextWidth;
        stepCanvas.height = nextHeight;
        const stepCtx = stepCanvas.getContext('2d')!;

        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = 'high';
        stepCtx.drawImage(canvas, 0, 0, nextWidth, nextHeight);

        canvas = stepCanvas;
        ctx = stepCtx;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem para upscale'));
    img.src = base64Data;
  });
};

export const renderImage = async (
  base64Image: string,
  mimeType: string,
  style: RenderStyle,
  resolution: RenderResolution = '1K'
): Promise<string> => {
  if (MOCK_MODE) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return base64Image;
  }

  // Priority: 1. Environment Variable -> 2. Local Storage -> 3. Firebase Key Fallback
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
  const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const primaryKey = geminiKey || firebaseKey;

  if (!primaryKey || primaryKey.includes("YOUR_AB")) {
    throw new Error("Chave de API não encontrada. Verifique o .env ou o painel da Vercel.");
  }

  const lightingPrompts: Record<RenderStyle, string> = {
    'Dia': 'Ultra-realistic bright sunny day, global illumination, natural sunlight, sharp high-contrast realistic shadows, vibrant materials.',
    'Noite': 'Hyper-realistic night scene, dramatic architectural interior/exterior lighting, warm glowing windows, dark natural sky, high contrast, Rayleigh scattering.',
    'Fim de Tarde': 'Golden hour sunset masterpiece, long soft volumetric shadows, warm orange/purple hues, cinematic lighting, realistic textures.',
    'Nublado': 'Overcast moody day, soft diffused realistic lighting, realistic ambient occlusion, no harsh shadows, natural architectural textures.',
    'Interior': 'Professional indoor architectural photography, soft natural light coming from windows, realistic interior artificial lighting (lamps/LEDs), global illumination, clean shadows, no exterior light artifacts inside walls, masterwork textures.'
  };

  let detailLevel = "";
  let qualityKeywords = "";

  // Ensure high quality for ALL resolutions, technical resolution only affects final size
  detailLevel = "AWARD-WINNING ARCHITECTURAL PHOTOGRAPHY. 8K. SHARP FOCUS. CLEAN AND INHABITED.";
  qualityKeywords = "architectural digest, professional photography, daylight, manicured landscaping, clear glass, modern furniture, vibrant colors, high dynamic range, 8k resolution";

  const prompt = `YOU ARE A PROFESSIONAL ARCHITECTURAL PHOTOGRAPHER.
  INPUT: A screenshot of a 3D modeling software (SketchUp/AutoCAD) showing a residential project.
  TASK: Generate a PHOTOREALISTIC PHOTO of the house in the real world.

  ### STRICT RULE: PRESERVE GEOMETRY
  1. **DO NOT INVENT** or hallucinate new buildings, landscapes, or structures. Use EXACTLY the geometry from the input.
  2. **CAMERA MATCH**: The angle, perspective, and field of view must be IDENTICAL to the input.

  ### STRICT RULE: REMOVE INTERFACE
  The input image contains software UI (windows, toolbars, menus, cursors, axes lines).
  **YOU MUST ERASE ALL UI ELEMENTS** and replace them with appropriate background (sky, grass, trees) that matches the scene.
  If a toolbar covers the sky, replace it with SKY. If a menu covers the grass, replace it with GRASS.

  ### VISUAL STYLE & MATERIALS
  1. **STYLE**: ${lightingPrompts[style]}.
  2. **QUALITY**: ${qualityKeywords}.
  3. **MATERIALS**: Transform simple colors into REAL TEXTURES (concrete, wood, glass, metal, grass).

  ### NEGATIVE PROMPT (AVOID THESE):
  Software interface, user interface, UI, HUD, buttons, text, menus, toolbars, taskbar, window borders, mouse cursor, axis lines, grid lines, sketch lines, cartoon, drawing, painting, watercolor, low quality, blurry, swamp, overgrown jungle, ruins, apocalyptic, messy, dirty, mud.

  OUTPUT: A CLEAN, HIGH-QUALITY ARCHITECTURAL PHOTOGRAPH.`;

  // Unified model list: Prioridade no Pro com Fallback para o 3.1 Flash
  const modelsToTry = [
    'gemini-3-pro-image-preview',    // Qualidade Máxima (Nano Banana Pro)
    'gemini-3.1-flash-image-preview' // Alta Velocidade (Nano Banana 2)
  ];

  const premiumModels = [
    'gemini-3-pro-image-preview',
    'gemini-3.1-flash-image-preview'
  ];

  const keysToTry = [geminiKey, firebaseKey].filter(k => k && !k.includes("YOUR_AB")) as string[];

  let generatedImageBase64: string | null = null;
  let usedPremiumModel = false;
  let lastError = "";

  for (const currentKey of keysToTry) {
    const aiInstance = new GoogleGenAI({ apiKey: currentKey });

    for (const modelName of modelsToTry) {
      try {
        console.log(`Tentando: ${modelName} | Key: ${currentKey.substring(0, 5)}...`);

        const isPremium = premiumModels.includes(modelName);
        const config: any = { responseModalities: ['Text', 'Image'] };

        if (isPremium && resolution === '4K') {
          config.imageConfig = { imageSize: '4K' };
        }

        const response = await aiInstance.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { data: base64Image.split(',')[1], mimeType } },
              { text: prompt },
            ],
          },
          config,
        });

        console.log(`Sucesso com modelo: ${modelName}`);

        for (const part of response.candidates?.[0]?.content.parts || []) {
          if (part.inlineData) {
            generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            usedPremiumModel = isPremium;
            break;
          }
        }

        if (generatedImageBase64) break;

      } catch (error: any) {
        lastError = error.message;
        console.warn(`Erro no modelo ${modelName} (Key: ${currentKey.substring(0, 5)}):`, lastError);

        // If quota hit (429) or forbidden (403), try next key if available
        if (keysToTry.length > 1 && currentKey === keysToTry[0] && (lastError.includes("429") || lastError.includes("403"))) {
          console.warn("Troca de chave detectada devido a limite ou permissão.");
          break; // Exit model loop for current key
        }
      }
    }
    if (generatedImageBase64) break;
  }

  if (!generatedImageBase64) {
    if (lastError.includes("API_KEY_SERVICE_BLOCKED") || lastError.includes("403")) {
      throw new Error("CHAVE BLOQUEADA: Sua chave de API do Google foi bloqueada ou o limite foi atingido. Verifique o Google AI Studio.");
    }

    if (isOverload) {
      throw new Error("SERVIDOR EM CAPACIDADE MÁXIMA: O sistema está processando muitos pedidos ou em manutenção preventiva. Por favor, tente novamente em instantes.");
    }
    
    if (lastError.includes("404")) {
      throw new Error("RECURSO INDISPONÍVEL: Este modo de renderização não está disponível no momento. Tente outro estilo ou resolução.");
    }

    throw new Error("ERRO NO PROCESSAMENTO: Ocorreu uma instabilidade na conexão com o servidor de IA. Por favor, tente novamente.");
  }

  // --- Post-Processing: Upscale if needed ---
  const resConfig = RESOLUTION_CONFIG[resolution];

  if (resConfig.scaleFactor > 1 && !usedPremiumModel) {
    console.log(`Upscaling imagem: ${resConfig.scaleFactor}x para ${resolution}`);
    try {
      generatedImageBase64 = await upscaleImage(generatedImageBase64, resConfig.scaleFactor);
    } catch (upscaleError) {
      console.warn("Upscale falhou, retornando imagem original:", upscaleError);
    }
  }

  return generatedImageBase64;
};
