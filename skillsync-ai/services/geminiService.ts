
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, JobMatchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    email: { type: Type.STRING },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["company", "role", "description"]
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      }
    },
    projects: { type: Type.ARRAY, items: { type: Type.STRING } },
    atsScore: { type: Type.INTEGER },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["fullName", "skills", "experience", "atsScore"]
};

export const parseResumeText = async (text: string): Promise<ResumeData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract the following structured data from this resume text: ${text}. Return only valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    id: Math.random().toString(36).substr(2, 9),
    title: `Resume - ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(),
    rawText: text
  };
};

export const parseResumeDocument = async (base64Data: string, mimeType: string): Promise<ResumeData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: "Analyze this resume document and extract structured information. Return only valid JSON according to the schema."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    id: Math.random().toString(36).substr(2, 9),
    title: `Resume (File) - ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString()
  };
};

export const matchJobDescription = async (resume: ResumeData, jobDesc: string): Promise<JobMatchResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Compare the following resume data with this job description and calculate match metrics.
    Resume: ${JSON.stringify(resume)}
    Job Description: ${jobDesc}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER },
          matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedBulletPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.STRING }
              }
            }
          }
        },
        required: ["matchScore", "matchingSkills", "missingSkills", "optimizationTips"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
