
export enum JobCategory {
  SOFTWARE_IT = 'SOFTWARE & IT',
  CORE_ENGINEERING = 'CORE ENGINEERING',
  BUSINESS_MGMT = 'BUSINESS & MANAGEMENT',
  FINANCE_COMMERCE = 'FINANCE & COMMERCE',
  SALES_MARKETING = 'SALES & MARKETING',
  HR_NON_TECH = 'HR & NON-TECH',
  DESIGN_CREATIVE = 'DESIGN & CREATIVE',
  HEALTHCARE_MISC = 'HEALTHCARE & MISC'
}

export enum InterviewType {
  TECHNICAL = 'Technical Interview',
  HR = 'HR Interview',
  BEHAVIORAL = 'Behavioral Interview',
  CASE_STUDY = 'Case Study Interview',
  SYSTEM_DESIGN = 'System Design Interview',
  MANAGERIAL = 'Managerial Interview',
  STRESS = 'Stress Interview',
  SITUATIONAL = 'Situational Judgment Interview'
}

export enum CompanyType {
  STARTUP = 'Startup',
  PRODUCT_BASED = 'Product-based',
  MNC = 'MNC',
  FAANG = 'FAANG-style'
}

export enum ExperienceLevel {
  ENTRY = 'Entry Level (0-2 years)',
  MID = 'Mid Level (3-5 years)',
  SENIOR = 'Senior Level (6-10 years)',
  EXECUTIVE = 'Executive (10+ years)'
}

export interface EvaluationMetric {
  score: number;
  feedback: string;
  suggestion: string;
}

export interface InterviewEvaluation {
  domainKnowledge: EvaluationMetric;
  problemSolving: EvaluationMetric;
  logicalThinking: EvaluationMetric;
  communication: EvaluationMetric;
  clarityStructure: EvaluationMetric;
  confidence: EvaluationMetric;
  tone: EvaluationMetric;
  behavioralSTAR: EvaluationMetric;
  decisionMaking: EvaluationMetric;
  culturalFit: EvaluationMetric;
  timeManagement: EvaluationMetric;
  ethicalReasoning: EvaluationMetric;
  leadership?: EvaluationMetric;
  technicalAccuracy?: EvaluationMetric;
  creativityInnovation?: EvaluationMetric;
  overallScore: number;
  recruiterSummary: string;
}

export interface InterviewConfig {
  id: string;
  category: JobCategory;
  role: string;
  type: InterviewType;
  experience: ExperienceLevel;
  companyType: CompanyType;
  resumeText?: string;
  timestamp: number;
}

export interface ChatTurn {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
}

export interface InterviewSessionData {
  config: InterviewConfig;
  chatHistory: ChatTurn[];
  evaluation?: InterviewEvaluation;
  status: 'active' | 'completed';
}
