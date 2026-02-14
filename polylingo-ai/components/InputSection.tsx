
import React, { useRef } from 'react';
import { DetectionResult } from '../types';

interface InputSectionProps {
  value: string;
  onChange: (val: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
  detection: DetectionResult | null;
  onFileSelect: (file: File | null) => void;
  selectedFileName: string | null;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  value, onChange, onProcess, isProcessing, detection, onFileSelect, selectedFileName 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }
    onFileSelect(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden mb-8 transition-all hover:shadow-indigo-500/10">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={selectedFileName ? "You've uploaded a document. You can add extra notes here or just click Analyze." : "Paste text in any language or upload a PDF document..."}
          className="w-full min-h-[180px] p-6 text-lg text-white placeholder-slate-500 bg-transparent focus:outline-none resize-none"
        />
        
        {selectedFileName && (
          <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/40 rounded-lg px-3 py-1.5">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-indigo-100 truncate max-w-[150px]">{selectedFileName}</span>
              <button 
                onClick={() => onFileSelect(null)}
                className="ml-1 text-indigo-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf" 
            className="hidden" 
          />
          <button
            onClick={triggerFileInput}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload PDF
          </button>

          {detection && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-500/30">
                Detected: {detection.languageName}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {(detection.confidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
          )}
          
          {!detection && !isProcessing && (
             <div className="text-slate-500 text-xs italic hidden lg:block">
              AI detects and summarizes your inputs automatically
            </div>
          )}
        </div>

        <button
          onClick={onProcess}
          disabled={isProcessing || (!value.trim() && !selectedFileName)}
          className={`
            w-full md:w-auto px-10 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95
            ${isProcessing || (!value.trim() && !selectedFileName)
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          ) : (selectedFileName ? 'Summarize & Explain' : 'Analyze & Explain')}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
