
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => {
  // Use the API key directly from the environment as mandated.
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateCharacterImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `GTA V style character portrait. ${prompt}. Gritty urban background, cinematic lighting, photorealistic AAA game asset.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image signal lost.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateCarImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-end customized supercar in a GTA style neon garage. ${prompt}. Hyper-realistic, 4k, volumetric lighting.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Vehicle signal lost.");
  } catch (error) {
    console.error("Car Gen Error:", error);
    throw error;
  }
};

export const generateMissionDescription = async (theme: string, type: string, difficulty: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-stakes GTA mission theme. 
      Theme: ${theme}
      Requested Type: ${type}
      Requested Difficulty: ${difficulty}
      
      The mission must reflect the specified type and difficulty in its objectives and hook. Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING, description: "Must match the requested difficulty" },
            type: { type: Type.STRING, description: "Must match the requested mission type" },
            reward: { type: Type.NUMBER }
          },
          required: ["title", "hook", "objectives", "difficulty", "type", "reward"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Mission Gen Error:", error);
    throw error;
  }
};

export const generateBriefingAudio = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in a professional, slightly distorted military operator voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio signal lost.");
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};
