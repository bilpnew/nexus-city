
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Simplified initialization to use process.env.API_KEY directly as per guidelines.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterImage = async (prompt: string) => {
  const ai = getAI();
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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate character image");
};

export const generateCarImage = async (prompt: string) => {
  const ai = getAI();
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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate car image");
};

export const generateMissionDescription = async (theme: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a brief, gritty GTA-style mission description based on the theme: ${theme}. 
    Include a title, a one-sentence hook, and three tactical objectives. Return as JSON.`,
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
          difficulty: { type: Type.STRING }
        },
        required: ["title", "hook", "objectives", "difficulty"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
