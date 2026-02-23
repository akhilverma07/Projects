
import React, { useState } from 'react';
import { Language } from '../types';

interface LanguageCardProps {
  language: Language;
  explanation: string;
}

const LanguageCard: React.FC<LanguageCardProps> = ({ language, explanation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`
      bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group
      ${language.isRtl ? 'text-right' : 'text-left'}
    `}>
      <div className={`flex items-center justify-between mb-4 ${language.isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center gap-3 ${language.isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">{language.flag}</span>
          <div>
            <h3 className="font-bold text-slate-800 leading-none">{language.name}</h3>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{language.nativeName}</span>
          </div>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
          title="Copy explanation"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          )}
        </button>
      </div>

      <div 
        className={`text-slate-600 text-sm leading-relaxed whitespace-pre-wrap ${language.isRtl ? 'rtl' : ''}`}
        dir={language.isRtl ? 'rtl' : 'ltr'}
      >
        {explanation}
      </div>
    </div>
  );
};

export default LanguageCard;
