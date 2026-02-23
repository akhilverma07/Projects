
export enum ThreatLevel {
  SAFE = 'SAFE',
  SUSPICIOUS = 'SUSPICIOUS',
  DANGEROUS = 'DANGEROUS'
}

export enum AnalysisType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  URL = 'URL',
  QR_CODE = 'QR_CODE',
  VOICE_TRANSCRIPT = 'VOICE_TRANSCRIPT'
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  type: AnalysisType;
  threatLevel: ThreatLevel;
  confidenceScore: number; // 0-100
  fraudCategory: string;
  explanation: string;
  indicators: string[];
  recommendation: string;
  rawInput: string;
  metadata?: {
    sender?: string;
    url?: string;
    domainAge?: string;
    detectedLanguage?: string;
  };
}

export interface DashboardStats {
  totalScans: number;
  threatDistribution: {
    safe: number;
    suspicious: number;
    dangerous: number;
  };
  categoryBreakdown: Record<string, number>;
  userProtectionScore: number;
}
