
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, ExplanationResult, FilePart } from "./types";
import { SUPPORTED_LANGUAGES } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Detects the language of a given text or document content.
 */
export async function detectLanguage(text: string, file?: FilePart): Promise<DetectionResult> {
  const parts: any[] = [];
  if (file) parts.push(file);
  parts.push({ text: `Detect the language of the provided text or document content and provide a confidence score (0.0 to 1.0). Return the result as a JSON object. ${text ? `Text context: "${text}"` : ""}` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          languageName: { type: Type.STRING, description: "Full name of the detected language" },
          languageCode: { type: Type.STRING, description: "ISO 639-1 code of the language" },
          confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" }
        },
        required: ["languageName", "languageCode", "confidence"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as DetectionResult;
}

/**
 * Generates natural explanations and summaries in multiple target languages.
 */
export async function generateExplanations(
  text: string, 
  targetLanguages: string[],
  file?: FilePart
): Promise<ExplanationResult[]> {
  const langListStr = targetLanguages.join(", ");
  const parts: any[] = [];
  if (file) parts.push(file);
  
  parts.push({ 
    text: `Summarize the provided content and explain its key meanings/implications in these language codes: [${langListStr}]. 
    
    Guidelines:
    - If it's a long document, provide a concise summary first, then key points.
    - Provide a natural, context-aware explanation, not just a literal translation.
    - If it's an idiom or technical document, explain the figurative or specific meaning clearly.
    - Return an array of objects.
    
    ${text ? `Input Text: "${text}"` : ""}` 
  });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "ISO language code" },
            explanation: { type: Type.STRING, description: "Concise summary and natural explanation in that language" }
          },
          required: ["code", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text.trim()) as ExplanationResult[];
}
