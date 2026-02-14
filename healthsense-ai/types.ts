
export interface PhysicalHealthData {
  name: string;
  age: number;
  bmi: number;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  smoking: 'never' | 'former' | 'active';
  exerciseFreq: 'rarely' | 'weekly' | 'daily';
  medicalHistory: string;
  selectedDisease: string;
  specificValue?: string; // e.g., Blood sugar for diabetes
}

export interface MentalWellnessData {
  sleepHours: number;
  screenTime: number;
  mood: 'great' | 'okay' | 'stressed' | 'down';
  activityLevel: 'low' | 'moderate' | 'high';
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface HealthAnalysisResponse {
  stabilityScore: number;
  stabilityZone: 'Optimal' | 'Stable' | 'Warning' | 'Critical';
  explanation: string; // The "Why this result?"
  physicalRisk: {
    level: RiskLevel;
    score: number;
    factors: string[];
    recommendations: string[];
  };
  mentalWellness: {
    stressScore: number;
    burnoutWarning: boolean;
    insights: string[];
  };
  diseaseAdjustment: number; // e.g. +10% impact
  clinicalAdvice: {
    seeDoctor: boolean;
    urgency: 'Immediate' | 'Routine' | 'None';
    doctorReason: string;
    generalMedicines: string[];
  };
  wellnessPlan: {
    relaxationExercises: string[];
    sleepTips: string[];
    routinePlan: string[];
    uniqueHealthHack: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TrendData {
  day: string;
  stress: number;
  physical: number;
}
