
import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, APP_NAME } from './constants';
import { DetectionResult, ExplanationResult, HistoryItem, FilePart } from './types';
import { detectLanguage, generateExplanations } from './geminiService';

// Components
import Header from './components/Header';
import InputSection from './components/InputSection';
import LanguageCard from './components/LanguageCard';
import HistoryPanel from './components/HistoryPanel';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [results, setResults] = useState<ExplanationResult[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(SUPPORTED_LANGUAGES.map(l => l.code));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('polylingo_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when it updates
  useEffect(() => {
    localStorage.setItem('polylingo_history', JSON.stringify(history));
  }, [history]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleProcess = async () => {
    if (!inputText.trim() && !pdfFile) return;

    setIsProcessing(true);
    setError(null);
    setDetection(null);
    setResults([]);

    try {
      let filePart: FilePart | undefined;
      if (pdfFile) {
        const base64Data = await fileToBase64(pdfFile);
        filePart = {
          inlineData: {
            data: base64Data,
            mimeType: pdfFile.type,
          }
        };
      }

      // Step 1: Detect Language (and context from file if present)
      const detectResult = await detectLanguage(inputText, filePart);
      setDetection(detectResult);

      // Step 2: Generate Explanations/Summaries for selected languages
      const explanationResults = await generateExplanations(inputText, selectedLangs, filePart);
      setResults(explanationResults);

      // Step 3: Add to History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        inputText: pdfFile ? `Document Summary: ${pdfFile.name}` : inputText,
        inputFileName: pdfFile?.name,
        detectedLanguage: detectResult,
        explanations: explanationResults,
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));

    } catch (err: any) {
      console.error(err);
      setError("AI was unable to process this request. The file might be too large or complex. Please try again with shorter text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setInputText(item.inputFileName ? "" : item.inputText);
    setDetection(item.detectedLanguage);
    setResults(item.explanations);
    setPdfFile(null); // Clear active file when selecting from history
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('polylingo_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onToggleHistory={() => setShowHistory(!showHistory)} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-12">
             <InputSection 
              value={inputText}
              onChange={setInputText}
              onProcess={handleProcess}
              isProcessing={isProcessing}
              detection={detection}
              onFileSelect={setPdfFile}
              selectedFileName={pdfFile?.name || null}
            />
          </div>

          <div className="lg:col-span-12">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {!isProcessing && results.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">
                    {pdfFile ? 'Document Summary & Explanations' : 'Multilingual Explanations'}
                  </h2>
                  <span className="text-sm text-slate-500">{results.length} languages generated</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((res) => {
                    const langData = SUPPORTED_LANGUAGES.find(l => l.code === res.code);
                    if (!langData) return null;
                    return (
                      <LanguageCard 
                        key={res.code}
                        language={langData}
                        explanation={res.explanation}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <svg className="w-6 h-6 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-700 font-bold text-lg">PolyLingo AI is reading & synthesizing...</p>
                  <p className="text-sm text-slate-500">Generating context-aware summaries across {selectedLangs.length} languages.</p>
                </div>
              </div>
            )}

            {!isProcessing && results.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                </div>
                <p className="text-lg font-medium text-slate-900">Ready for your text or PDF</p>
                <p className="text-sm">Upload a document to get instant summaries and cross-lingual insights.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <HistoryPanel 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        history={history}
        onSelect={handleHistorySelect}
        onClear={clearHistory}
      />

      <Footer />
    </div>
  );
};

export default App;
