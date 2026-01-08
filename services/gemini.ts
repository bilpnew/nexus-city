
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", text);
    throw new Error("Invalid intelligence data format received.");
  }
};

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
  throw new Error("Failed to generate character image: No image data returned.");
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
  throw new Error("Failed to generate car image: No image data returned.");
};

export const generateMissionDescription = async (theme: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a brief, gritty GTA-style mission description based on the theme: ${theme}. 
    Include a title, a one-sentence hook, three tactical objectives, and a high payout amount. 
    Select a mission type from: Heist, Stealth, Combat, Driving, Hacking.
    Select a difficulty from: Low, Medium, High, Extreme, Legendary.
    Return as JSON.`,
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
  
  return extractJSON(response.text || '{}');
};
