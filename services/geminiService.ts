
import { GoogleGenAI } from "@google/genai";
import { RenderStyle, RenderResolution } from "../types";

// MODO DE TESTE: Altere para 'false' para ativar a IA real
// MODO DE TESTE: Altere para 'false' para ativar a IA real
export const MOCK_MODE = false;

export const renderImage = async (
  base64Image: string,
  mimeType: string,
  style: RenderStyle,
  resolution: RenderResolution = '1K'
): Promise<string> => {
  if (MOCK_MODE) {
    // Simular delay de processamento (3 segundos)
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Retorna a própria imagem original para testar o fluxo sem gastar créditos de IA
    return base64Image;
  }

  // Always use a new instance right before the call to ensure the latest API key is used
  // Priority: 1. Environment Variable (.env) -> 2. Local Storage (for debugging)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

  if (!apiKey || apiKey.includes("YOUR_AB")) {
    console.error("DEBUG: API Key está faltando ou é inválida.", { keyLength: apiKey?.length, isDefined: !!apiKey });
    throw new Error("Chave de API não encontrada (VITE_GEMINI_API_KEY). Verifique o .env ou o painel da Vercel.");
  }

  if (apiKey) {
    console.log("DEBUG: API Key detectada com sucesso.", { length: apiKey.length });
  }

  // @google/genai SDK requires an object { apiKey: string }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const lightingPrompts: Record<RenderStyle, string> = {
    'Dia': 'Bright sunny day lighting, clear blue sky, sharp realistic shadows, vibrant natural colors.',
    'Noite': 'Night time scene, dramatic artificial interior and exterior lighting, glowing windows, dark starry sky, high contrast.',
    'Fim de Tarde': 'Golden hour sunset lighting, warm orange and purple hues, long soft shadows, cinematic atmosphere.',
    'Nublado': 'Overcast cloudy day, soft diffused lighting, no harsh shadows, realistic moody atmosphere, natural tones.'
  };


  /* 
    Enhanced Resolution Tier Logic:
    We use prompt engineering to simulate resolution differences since the model output is fixed size.
  */
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

  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-pro-exp-02-05'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Tentando gerar com modelo: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          // config is optional in the new SDK
        }
      });

      console.log(`Sucesso com modelo: ${modelName}`);

      // Iterate through all parts to find the image part
      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }

      // If we got a response but no image, maybe this model returned text refusing?
      // Check for text refusal
      const textPart = response.candidates?.[0]?.content.parts?.find(p => p.text)?.text;
      if (textPart) {
        console.warn(`Modelo ${modelName} retornou texto em vez de imagem:`, textPart);
        // Don't throw immediately, maybe next model works? 
        // Actually, if it refused, it might be safety. But let's verify next model.
      }

    } catch (error: any) {
      console.warn(`Falha com modelo ${modelName}:`, error.message);

      // If it's the last model, throw the error
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("Todas as tentativas de modelo falharam.");
        // Enhance error for user
        if (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
          throw new Error("Cota excedida (429). Verifique o Billing no Google Cloud ou aguarde.");
        }
        if (error.message.includes("404")) {
          throw new Error("Modelo não disponível na sua região ou chave inválida.");
        }
        throw error;
      }
      // Otherwise continue to next model
      continue;
    }
  }

  throw new Error("Nenhum modelo conseguiu gerar a imagem. Tente novamente mais tarde.");
};
