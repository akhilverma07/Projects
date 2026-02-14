
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnalysisType, ThreatLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    threatLevel: {
      type: Type.STRING,
      description: 'One of SAFE, SUSPICIOUS, DANGEROUS',
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: 'A score from 0 to 100 representing the certainty of the assessment.',
    },
    fraudCategory: {
      type: Type.STRING,
      description: 'The type of scam detected (e.g., "CEO Fraud", "Smishing", "Malicious URL").',
    },
    explanation: {
      type: Type.STRING,
      description: 'A clear, detailed explanation of why this was flagged.',
    },
    indicators: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of specific red flags found.',
    },
    recommendation: {
      type: Type.STRING,
      description: 'Advice for the user on how to handle this message.',
    },
  },
  required: ['threatLevel', 'confidenceScore', 'fraudCategory', 'explanation', 'indicators', 'recommendation'],
};

export const analyzeContent = async (
  content: string, 
  type: AnalysisType,
  image?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are PhishGuard AI, a world-class cybersecurity forensic analyst. 
  Your primary mission is to detect Phishing, Smishing, Vishing, and general Fraud.
  
  ANALYSIS PROTOCOL:
  1. Intent Analysis: Determine if the sender is trying to extract PII, credentials, or money.
  2. Psychological Triggers: Look for "Urgency," "Authority," "Fear," "Scarcity," or "Reward."
  3. Technical Inspection: Look for look-alike domains, suspicious redirects, and obfuscated URLs.
  4. Behavioral Profiling: Compare the message against known scam templates (e.g., Geek Squad invoice, Netflix account hold).
  
  For images, perform OCR to extract text and analyze visual layout consistency.
  Provide an objective risk assessment and clear actionable steps for the user.`;

  const prompt = `Analyze this ${type} communication for potential security threats:
  ---
  CONTENT:
  ${content}
  ---
  ${image ? 'NOTE: An image/screenshot is provided. Extract text and analyze visual cues.' : ''}`;

  const contents: any[] = [{ text: prompt }];
  if (image) {
    contents.unshift({
      inlineData: {
        data: image.data.split(',')[1],
        mimeType: image.mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        thinkingConfig: { thinkingBudget: 1500 }
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      threatLevel: result.threatLevel as ThreatLevel,
      confidenceScore: result.confidenceScore,
      fraudCategory: result.fraudCategory,
      explanation: result.explanation,
      indicators: result.indicators,
      recommendation: result.recommendation,
      rawInput: content,
    };
  } catch (error) {
    console.error("PhishGuard Analysis Engine Error:", error);
    throw new Error("Analysis failed. The security engine timed out or encountered an unexpected payload.");
  }
};
