
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
    throw new Error("Chave de API não encontrada (VITE_GEMINI_API_KEY). Verifique o .env ou o painel da Vercel.");
  }

  const ai = new GoogleGenAI(apiKey);

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

  try {
    console.log("Iniciando geração com modelo: gemini-2.0-flash");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
        // config is optional in the new SDK, relying on model defaults
      }
    });

    console.log("Resposta Gemini recebida. Processando...");

    // Iterate through all parts to find the image part as per guidelines
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("A IA gerou uma resposta, mas não continha imagem. Tente simplificaro prompt.");
  } catch (error: any) {
    console.error("Gemini API Fatal Error:", error);

    // Extract more details if available
    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", await error.response.json());
    }

    throw new Error(`Erro na IA: ${error.message || "Falha desconhecida"}`);
  }
};
