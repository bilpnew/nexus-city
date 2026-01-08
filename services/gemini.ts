
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generateCharacterData = async (userPrompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-detail criminal operative profile based on this concept: "${userPrompt}". 
      Provide a cool name, a specific criminal role, detailed attributes, and a descriptive prompt for an image generator. 
      Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            description: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                driving: { type: Type.NUMBER },
                shooting: { type: Type.NUMBER },
                hacking: { type: Type.NUMBER },
                strength: { type: Type.NUMBER }
              },
              required: ["driving", "shooting", "hacking", "strength"]
            },
            imagePrompt: { type: Type.STRING, description: "Detailed visual description for an image AI" }
          },
          required: ["name", "role", "description", "stats", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Character Metadata Error:", error);
    throw error;
  }
};

export const generateCarData = async (userPrompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate technical specs for a custom illegal street racing vehicle based on: "${userPrompt}". 
      Provide a model name, a vehicle class, performance stats, and a cinematic image prompt. 
      Output JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            model: { type: Type.STRING },
            class: { type: Type.STRING },
            description: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                speed: { type: Type.NUMBER },
                handling: { type: Type.NUMBER },
                armor: { type: Type.NUMBER }
              },
              required: ["speed", "handling", "armor"]
            },
            imagePrompt: { type: Type.STRING, description: "Cinematic visual description for an image AI" }
          },
          required: ["model", "class", "description", "stats", "imagePrompt"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Car Metadata Error:", error);
    throw error;
  }
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

export const generateMissionVideo = async (mission: any, updateStatus: (msg: string) => void): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  updateStatus("Initializing best neural renderer...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic AAA game action replay of a ${mission.type} mission titled "${mission.title}". ${mission.hook}. High-speed car chase, neon lights, gritty urban atmosphere, explosive action. GTA V style aesthetic.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  const statusMessages = [
    "Synthesizing volumetric lighting...",
    "Simulating vehicle physics...",
    "Processing security footage artifacts...",
    "Encoding cinematic transitions...",
    "Finalizing neural stream..."
  ];

  let i = 0;
  while (!operation.done) {
    updateStatus(statusMessages[i % statusMessages.length]);
    i++;
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
