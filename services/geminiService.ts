
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
    'Dia': 'Bright sunny day lighting, clear blue sky, sharp realistic shadows, vibrant natural colors.',
    'Noite': 'Night time scene, dramatic artificial interior and exterior lighting, glowing windows, dark starry sky, high contrast.',
    'Fim de Tarde': 'Golden hour sunset lighting, warm orange and purple hues, long soft shadows, cinematic atmosphere.',
    'Nublado': 'Overcast cloudy day, soft diffused lighting, no harsh shadows, realistic moody atmosphere, natural tones.'
  };

  let detailLevel = "";
  let qualityKeywords = "";

  switch (resolution) {
    case '1K':
      detailLevel = "STANDARD QUALITY. Good for quick visualization. Balanced details. Standard lighting.";
      qualityKeywords = "nice render, standard architectural visualization";
      break;
    case '2K':
      detailLevel = "HIGH DEFINITION. Sharp focus, refined textures, professional lighting, crisp edges.";
      qualityKeywords = "high fidelity, professional architectural photography, 4k textures, detailed foliage";
      break;
    case '4K':
      detailLevel = "ULTRA-PREMIUM MASTERPIECE. 8K TEXTURES. RAYTRACING STYLE. EXTREME DETAIL. MICRO-SURFACE DETAILS.";
      qualityKeywords = "award winning photography, unreal engine 5 render, global illumination, macro details, perfect composition";
      break;
    default:
      detailLevel = "HIGH QUALITY";
      qualityKeywords = "photorealistic";
  }

  const prompt = `Act as a professional architectural visualizer specializing in Brazilian Architecture. 
  Transform this input sketch/photo into a ${resolution} render.

  CRITICAL RULES:
  1. STRICT ADHERENCE: Maintain the EXACT geometry.
  2. QUALITY TIER: ${detailLevel}
  3. BRAZILIAN CONTEXT: "Modern Brazilian" or "Tropical Modernism".
  4. INTERIOR/EXTERIOR AWARENESS: Check view type.
  5. LIGHTING: ${lightingPrompts[style]}.
  6. STYLE KEYWORDS: ${qualityKeywords}.
  
  Output ONLY the rendered image.`;

  const baseModels = [
    'imagen-3',
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.5-flash-image',
    'imagen-3.0-fast-generate-001',
  ];

  const premiumModels = [
    'gemini-3-pro-image-preview',
    'imagen-3.0-generate-002',
    'imagen-3',
  ];

  const modelsToTry = resolution === '4K'
    ? [...new Set([...premiumModels, ...baseModels])]
    : baseModels;

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
