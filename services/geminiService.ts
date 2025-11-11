import { GoogleGenAI, Modality, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function editImage(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in the Gemini API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // More specific error messages for common issues
        if (error.message.includes('400')) {
             throw new Error("Bad request. The prompt or image may be inappropriate or unsupported. Please try again.");
        }
        if (error.message.includes('500')) {
            throw new Error("The AI model is currently unavailable. Please try again later.");
        }
    }
    throw new Error("Failed to generate image. Please check the console for details.");
  }
}

export async function recognizeObjects(
  base64ImageData: string,
  mimeType: string
): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze the image of the product. Identify the main object, its category, and key visual attributes (e.g., color, material). Provide a list of 5-7 concise, relevant tags. For example, for an image of red running shoes, tags could be ['shoes', 'sneakers', 'running shoes', 'red', 'sportswear']. Return only a JSON array of strings.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A descriptive tag for the product in the image.",
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const tags = JSON.parse(jsonText);

    if (!Array.isArray(tags) || !tags.every(t => typeof t === 'string')) {
      throw new Error("API returned an invalid tag format.");
    }
    
    return tags;

  } catch (error) {
    console.error("Error calling Gemini API for object recognition:", error);
    throw new Error("Failed to recognize objects in the image.");
  }
}
