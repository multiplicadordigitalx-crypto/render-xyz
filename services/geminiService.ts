
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
    'Nublado': 'Overcast moody day, soft diffused realistic lighting, realistic ambient occlusion, no harsh shadows, natural architectural textures.'
  };

  let detailLevel = "";
  let qualityKeywords = "";

  // Ensure high quality for ALL resolutions, technical resolution only affects final size
  detailLevel = "8K ULTRA-PREMIUM MASTERPIECE. UNREAL ENGINE 5 STYLE. RAYTRACING. EXTREME MICRO-DETAILS. MOVIE QUALITY.";
  qualityKeywords = "award winning architectural photography, photorealism, raytracing, global illumination, macro texture details, perfect realism, masterpiece, crisp edges";

  const prompt = `Act as a world-class architectural visualizer. 
  Transform this input (sketch, Sketchup model, or line-art) into a HYPER-REALISTIC ${resolution} render.

  ### TOP PRIORITY RULES:
  1. **STRICT GEOMETRIC PRESERVATION**: The output MUST have the EXACT SAME camera angle, perspective, and architectural geometry as the input. DO NOT change the position of walls, windows, or structural elements.
  2. **HYPER-REALISM**: Transform all surfaces into high-end realistic materials (concrete, wood, glass, stone, grass).
  3. **UI & LOGO REMOVAL**: If the input is a screenshot from a tool (like Sketchup, AutoCAD, or Windows), IGNORE the toolbars, UI buttons, window borders, and logos. Render ONLY the central architectural project.
  4. **VISUAL QUALITY**: ${detailLevel}
  5. **CONTEXT**: "Modern Brazilian Architecture" / "Tropical Modernism".
  6. **LIGHTING & STYLE**: ${lightingPrompts[style]}. Keywords: ${qualityKeywords}.

  Output ONLY the final rendered image. NO toolbars, NO text, NO watermarks.`;

  // Unified model list: always try the best models first for all resolutions
  const modelsToTry = [
    'gemini-3-pro-image-preview',
    'imagen-3.0-generate-002',
    'imagen-3',
    'imagen-3.0-generate-001',
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.5-flash-image',
  ];

  const premiumModels = [
    'gemini-3-pro-image-preview',
    'imagen-3.0-generate-002',
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
    if (lastError.includes("429")) throw new Error("LIMITE ATINGIDO: Suas chaves de API chegaram ao limite do Google. Ative o faturamento ou aguarde.");
    if (lastError.includes("404")) throw new Error("MODELO INDISPONÍVEL: Os modelos de imagem não estão disponíveis para esta chave/região.");
    throw new Error(lastError || "Nenhum modelo de IA disponível respondeu.");
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
