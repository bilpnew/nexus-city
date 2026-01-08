
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Initialize the Google GenAI client.
 * The API key is sourced from process.env.API_KEY as per the platform requirements.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a character portrait using the gemini-2.5-flash-image model.
 */
export const generateCharacterImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A highly detailed, AAA game quality portrait of a character in a gritty cyberpunk/GTA-style urban setting. Character description: ${prompt}. Professional lighting, 4k resolution, cinematic style.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    // Iterate through parts to find the image part
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned from model.");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a vehicle image using the gemini-2.5-flash-image model.
 */
export const generateCarImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A photorealistic, AAA game quality studio shot of a customized high-end vehicle in a futuristic neon garage. Vehicle description: ${prompt}. Glossy finish, volumetric lighting, epic composition.` }
        ]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No vehicle image data returned from model.");
  } catch (error) {
    console.error("Vehicle Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a mission description using structured JSON output from gemini-3-flash-preview.
 */
export const generateMissionDescription = async (theme: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a brief, gritty GTA-style mission description based on the theme: ${theme}. 
      Include a title, a one-sentence hook, three tactical objectives, and a high payout amount. 
      Select a mission type from: Heist, Stealth, Combat, Driving, Hacking.
      Select a difficulty from: Low, Medium, High, Extreme, Legendary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            objectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            difficulty: { type: Type.STRING },
            type: { type: Type.STRING },
            reward: { type: Type.NUMBER }
          },
          required: ["title", "hook", "objectives", "difficulty", "type", "reward"]
        }
      }
    });
    
    // Using response.text property (not a method) as per SDK instructions
    const text = response.text;
    if (!text) throw new Error("Empty response from mission intelligence.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Mission Generation Error:", error);
    throw error;
  }
};
