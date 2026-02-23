
import { GoogleGenAI, Type } from "@google/genai";
import { PhysicalHealthData, MentalWellnessData, HealthAnalysisResponse } from "../types";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    stabilityScore: { type: Type.NUMBER, description: "0-100 score where 100 is perfectly stable" },
    stabilityZone: { type: Type.STRING, description: "Optimal, Stable, Warning, or Critical" },
    explanation: { type: Type.STRING, description: "Clear explanation of why this score was given" },
    physicalRisk: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING },
        score: { type: Type.NUMBER },
        factors: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["level", "score", "factors", "recommendations"]
    },
    mentalWellness: {
      type: Type.OBJECT,
      properties: {
        stressScore: { type: Type.NUMBER },
        burnoutWarning: { type: Type.BOOLEAN },
        insights: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["stressScore", "burnoutWarning", "insights"]
    },
    diseaseAdjustment: { type: Type.NUMBER, description: "Impact of existing disease on overall risk (+X%)" },
    clinicalAdvice: {
      type: Type.OBJECT,
      properties: {
        seeDoctor: { type: Type.BOOLEAN },
        urgency: { type: Type.STRING },
        doctorReason: { type: Type.STRING },
        generalMedicines: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["seeDoctor", "urgency", "doctorReason", "generalMedicines"]
    },
    wellnessPlan: {
      type: Type.OBJECT,
      properties: {
        relaxationExercises: { type: Type.ARRAY, items: { type: Type.STRING } },
        sleepTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        routinePlan: { type: Type.ARRAY, items: { type: Type.STRING } },
        uniqueHealthHack: { type: Type.STRING }
      },
      required: ["relaxationExercises", "sleepTips", "routinePlan", "uniqueHealthHack"]
    }
  },
  required: ["stabilityScore", "stabilityZone", "explanation", "physicalRisk", "mentalWellness", "diseaseAdjustment", "clinicalAdvice", "wellnessPlan"]
};

export async function analyzeHealthData(
  physical: PhysicalHealthData,
  mental: MentalWellnessData
): Promise<HealthAnalysisResponse> {
  const prompt = `
    Perform a master health stability analysis for patient: ${physical.name}.
    
    VITALS: Age ${physical.age}, BMI ${physical.bmi}, BP ${physical.systolicBP}/${physical.diastolicBP}, HR ${physical.heartRate}.
    DISEASE INFO: ${physical.selectedDisease} (${physical.specificValue || 'N/A'}), History: ${physical.medicalHistory}.
    LIFESTYLE: Smoke: ${physical.smoking}, Ex: ${physical.exerciseFreq}.
    MENTAL: Sleep ${mental.sleepHours}h, Screen ${mental.screenTime}h, Mood ${mental.mood}.

    TASK:
    1. Calculate a "Health Stability Score" (0-100, higher is better).
    2. Identify the "Stability Zone".
    3. Provide a transparent "Why this result?" explanation.
    4. Calculate a "Disease Adjustment" percentage (how much the existing condition increases risk).
    5. Standard risk levels for physical and mental health.
    6. Clinical advice & medicine predictions.
    7. A Unique Wellness Hack.

    Tone: Professional, transparent, and guardian-like.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text) as HealthAnalysisResponse;
}

export async function getChatResponse(history: any[], message: string) {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are HealthSense AI Wellness Coach. Use the user\'s data to provide specific, encouraging advice. Be concise and medical-grade.'
    }
  });
  const result = await chat.sendMessage({ message });
  return result.text;
}
