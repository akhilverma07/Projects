
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewConfig, ChatTurn, InterviewEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const INTERVIEWER_SYSTEM_PROMPT = `
You are a senior AI interviewer, industrial psychologist, and subject matter expert. 
Your goal is to conduct a realistic, professional, and challenging interview.

Context:
Role: {role}
Category: {category}
Interview Type: {type}
Experience Level: {experience}
Company Context: {companyType}
{resumeContext}

Instructions:
1. Conduct the interview ONE question at a time.
2. Adjust difficulty based on the candidate's answers.
3. If an answer is vague, ask an adaptive follow-up.
4. Simulate realistic pressure for Stress Interviews.
5. Use a professional, slightly demanding but fair tone.
6. Look for STAR (Situation, Task, Action, Result) in behavioral questions.
7. If the candidate asks a question, answer briefly as an interviewer would and move to the next topic.

Start by introducing yourself briefly and asking the first question.
`;

const EVALUATOR_SYSTEM_PROMPT = `
You are a senior hiring committee chair and industrial psychologist.
Analyze the following interview transcript and provide a deep, holistic evaluation.

Evaluation Criteria (Scored 0-10):
1. Domain Knowledge
2. Problem-Solving Ability
3. Logical Thinking
4. Communication Skills
5. Clarity & Structure
6. Confidence Level
7. Professional Tone
8. Behavioral Indicators (STAR method)
9. Decision-Making Skills
10. Cultural Fit
11. Time Management
12. Ethical Reasoning
13. Leadership Potential (if applicable)
14. Technical Accuracy (for technical roles)
15. Creativity & Innovation (for creative roles)

You must return a JSON object containing scores, feedback, and improvement suggestions for each dimension.
`;

export const startInterview = async (config: InterviewConfig) => {
  const resumeContext = config.resumeText ? `Candidate Resume: ${config.resumeText}` : '';
  const prompt = INTERVIEWER_SYSTEM_PROMPT
    .replace('{role}', config.role)
    .replace('{category}', config.category)
    .replace('{type}', config.type)
    .replace('{experience}', config.experience)
    .replace('{companyType}', config.companyType)
    .replace('{resumeContext}', resumeContext);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return response.text;
};

export const getNextQuestion = async (config: InterviewConfig, chatHistory: ChatTurn[]) => {
  const resumeContext = config.resumeText ? `Candidate Resume: ${config.resumeText}` : '';
  const systemPrompt = INTERVIEWER_SYSTEM_PROMPT
    .replace('{role}', config.role)
    .replace('{category}', config.category)
    .replace('{type}', config.type)
    .replace('{experience}', config.experience)
    .replace('{companyType}', config.companyType)
    .replace('{resumeContext}', resumeContext);

  const contents = chatHistory.map(turn => ({
    role: turn.role === 'interviewer' ? 'model' : 'user',
    parts: [{ text: turn.content }]
  }));

  // Add system instruction as the first user message if needed, or better, use config.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents as any,
    config: {
      systemInstruction: systemPrompt
    }
  });

  return response.text;
};

const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    domainKnowledge: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    problemSolving: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    logicalThinking: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    communication: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    clarityStructure: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    confidence: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    tone: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    behavioralSTAR: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    decisionMaking: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    culturalFit: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    timeManagement: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    ethicalReasoning: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    leadership: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    technicalAccuracy: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    creativityInnovation: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING }, suggestion: { type: Type.STRING } } },
    overallScore: { type: Type.NUMBER },
    recruiterSummary: { type: Type.STRING }
  },
  required: ['overallScore', 'recruiterSummary']
};

export const evaluateInterview = async (config: InterviewConfig, chatHistory: ChatTurn[]): Promise<InterviewEvaluation> => {
  const transcript = chatHistory.map(turn => `${turn.role.toUpperCase()}: ${turn.content}`).join('\n\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ 
      role: 'user', 
      parts: [{ text: `Evaluate this interview transcript for a ${config.role} position:\n\n${transcript}` }] 
    }],
    config: {
      systemInstruction: EVALUATOR_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: evaluationSchema as any
    }
  });

  return JSON.parse(response.text || '{}');
};
