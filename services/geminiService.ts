
import { GoogleGenAI } from "@google/genai";
import { RenderStyle, RenderResolution } from "../types";

// MODO DE TESTE: Altere para 'false' para ativar a IA real
export const MOCK_MODE = true;

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI(apiKey);

  const lightingPrompts: Record<RenderStyle, string> = {
    'Dia': 'Bright sunny day lighting, clear blue sky, sharp realistic shadows, vibrant natural colors.',
    'Noite': 'Night time scene, dramatic artificial interior and exterior lighting, glowing windows, dark starry sky, high contrast.',
    'Fim de Tarde': 'Golden hour sunset lighting, warm orange and purple hues, long soft shadows, cinematic atmosphere.',
    'Nublado': 'Overcast cloudy day, soft diffused lighting, no harsh shadows, realistic moody atmosphere, natural tones.'
  };

  const prompt = `Transform this architecture sketch or photo into a hyper-realistic high-end ${resolution} architectural render. 
  Lighting Condition: ${lightingPrompts[style]}. 
  Maintain the original geometry, structure, and perspective exactly. 
  Add realistic textures and professional materials (glass, wood, concrete, fabric).
  The output must be a single realistic image part.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
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
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: resolution
        }
      }
    });

    // Iterate through all parts to find the image part as per guidelines
    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Não foi possível gerar a imagem. Tente outro estilo ou imagem.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
