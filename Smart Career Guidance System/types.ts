
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeData {
  id: string;
  title: string;
  fullName: string;
  email: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: string[];
  atsScore: number;
  suggestions: string[];
  rawText?: string;
  createdAt: string;
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  optimizationTips: string[];
  suggestedBulletPoints: { original: string; improved: string }[];
}

export type View = 'LANDING' | 'AUTH' | 'DASHBOARD' | 'ANALYZER' | 'MATCHER' | 'HISTORY';

export interface AppState {
  view: View;
  user: User | null;
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  analysisResults: JobMatchResult | null;
}
