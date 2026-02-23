
export interface Language {
  code: string;
  name: string;
  flag: string;
  isRtl: boolean;
  nativeName: string;
}

export interface DetectionResult {
  languageName: string;
  confidence: number;
  languageCode: string;
}

export interface ExplanationResult {
  code: string;
  explanation: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputText: string;
  inputFileName?: string;
  detectedLanguage: DetectionResult;
  explanations: ExplanationResult[];
}

export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}
