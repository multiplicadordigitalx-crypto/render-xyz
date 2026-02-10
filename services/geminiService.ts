
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI(apiKey);

  const lightingPrompts: Record<RenderStyle, string> = {
    'Dia': 'Bright sunny day lighting, clear blue sky, sharp realistic shadows, vibrant natural colors.',
    'Noite': 'Night time scene, dramatic artificial interior and exterior lighting, glowing windows, dark starry sky, high contrast.',
    'Fim de Tarde': 'Golden hour sunset lighting, warm orange and purple hues, long soft shadows, cinematic atmosphere.',
    'Nublado': 'Overcast cloudy day, soft diffused lighting, no harsh shadows, realistic moody atmosphere, natural tones.'
  };


  /* 
    Enhanced 4K Prompt Logic:
    Gemini 2.0 Flash generally outputs at standard resolutions (approx 1024x1024 varies by aspect ratio).
    To simulate "4K" quality, we enforce strict high-fidelity prompt keywords.
  */
  const detailLevel = resolution === '4K'
    ? "EXTREME DETAIL, 8K TEXTURES, MAGNIFICENT, ULTRA-SHARP FOCUS, ARCHITECTURAL PHOTOGRAPHY MASTERPIECE"
    : "HIGH DETAIL, SHARP FOCUS, PHOTOREALISTIC";

  const prompt = `Act as a professional architectural visualizer specializing in Brazilian Architecture. 
  Transform this input sketch/photo into a hyper-realistic high-end ${resolution} render.

  CRITICAL RULES:
  1. STRICT ADHERENCE: Maintain the EXACT geometry, perspective, and structural elements of the input. DO NOT hallucinate, add, or remove windows, doors, or walls. Follow the drawing lines precisely.
  2. BRAZILIAN CONTEXT: Use materials and aesthetics typical of high-end Brazilian architecture (Concrete, Wood, lush tropical vegetation, Cobogós if applicable). The style should be "Modern Brazilian" or "Tropical Modernism".
  3. CONTEXT AWARENESS: Analyze if the image is an INTERIOR or EXTERIOR view.
     - If INTERIOR: Do NOT put sun, clouds, or outdoor elements inside the room. Ensure lighting comes from windows/openings.
     - If EXTERIOR: lush landscaping suitable for Brazil.
  4. LIGHTING: ${lightingPrompts[style]}.
  5. MATERIALS: Photorealistic textures (glass, wood, concrete, fabric).
  6. QUALITY: ${detailLevel}.
  
  Output ONLY the rendered image.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using the latest available Flash model ("Nano Banana" equivalent)
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
        // Note: gemini-2.0-flash-exp supports generationConfig, but exact image sizing is often model-dependent.
        // We set aspect ratio to 16:9 as standard for architectural visualization.
        generationConfig: {
          responseMimeType: "image/jpeg"
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
