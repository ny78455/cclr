import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: API Key must be set in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const REASONING_MODEL = 'gemini-3-pro-preview';

export const analyzeCharacterConsistency = async (
  character: string,
  claim: string,
  context: string[]
): Promise<{ prediction: 0 | 1; rationale: string }> => {
  if (!process.env.API_KEY) {
    // Fallback mock response if no key is present for demo purposes
    console.warn("No API Key found. Returning mock response.");
    return new Promise(resolve => setTimeout(() => resolve({
      prediction: 0,
      rationale: "API Key missing. Mock: The retrieved context contradicts the claim that the character was honest."
    }), 1000));
  }

  const contextText = context.join("\n---\n");
  
  const prompt = `
    You are the "Character-Conditioned Long-Term Memory Reasoner" (CC-LTMR).
    Your task is to determine if a character's backstory claim is consistent with the provided novel excerpts.
    
    Character: ${character}
    Claim: ${claim}
    
    Retrieved Novel Context (Evidence):
    ${contextText}
    
    Analyze the evidence deeply. 
    If the claim is consistent with the evidence, output prediction 1.
    If the claim contradicts the evidence, output prediction 0.
    Provide a single clean sentence as rationale.
  `;

  try {
    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.INTEGER, description: "0 for Contradiction, 1 for Consistent" },
            rationale: { type: Type.STRING, description: "One clean sentence explaining the reasoning." }
          },
          required: ["prediction", "rationale"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      prediction: result.prediction === 1 ? 1 : 0,
      rationale: result.rationale || "No rationale provided."
    };

  } catch (error) {
    console.error("Gemini Reasoning Error:", error);
    return {
      prediction: 0,
      rationale: "Error during reasoning phase. Defaulting to 0."
    };
  }
};