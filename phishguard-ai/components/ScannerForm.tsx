
import React, { useState, useRef } from 'react';
import { 
  PaperClipIcon, 
  LinkIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon,
  QrCodeIcon,
  SpeakerWaveIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { AnalysisType } from '../types';

interface ScannerFormProps {
  onScan: (content: string, type: AnalysisType, image?: File) => void;
  isScanning: boolean;
}

const ScannerForm: React.FC<ScannerFormProps> = ({ onScan, isScanning }) => {
  const [activeTab, setActiveTab] = useState<AnalysisType>(AnalysisType.EMAIL);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: AnalysisType.EMAIL, label: 'Email', icon: <EnvelopeIcon className="w-5 h-5" /> },
    { id: AnalysisType.SMS, label: 'SMS / Text', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { id: AnalysisType.URL, label: 'URL / Link', icon: <LinkIcon className="w-5 h-5" /> },
    { id: AnalysisType.SOCIAL_MEDIA, label: 'Social', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { id: AnalysisType.QR_CODE, label: 'QR Code', icon: <QrCodeIcon className="w-5 h-5" /> },
    { id: AnalysisType.VOICE_TRANSCRIPT, label: 'Voice', icon: <SpeakerWaveIcon className="w-5 h-5" /> },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !selectedFile) return;
    onScan(content, activeTab, selectedFile || undefined);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedFile(null);
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-between">
            <span>{activeTab === AnalysisType.URL ? 'Target URL Analysis' : 'Security Payload'}</span>
            <span className="text-[10px] text-slate-600 font-mono">ENCRYPTED END-TO-END</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              activeTab === AnalysisType.URL 
                ? "Input URL (e.g., bank-account-login.net)" 
                : `Input raw ${activeTab.toLowerCase().replace('_', ' ')} text for inspection...`
            }
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-5 h-52 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-slate-100 placeholder:text-slate-700 resize-none mono text-sm shadow-inner"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept={activeTab === AnalysisType.QR_CODE ? "image/*" : ".eml,.txt,image/*"}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
            >
              {activeTab === AnalysisType.QR_CODE ? <PhotoIcon className="w-4 h-4 text-emerald-500" /> : <PaperClipIcon className="w-4 h-4 text-emerald-500" />}
              {selectedFile ? <span className="text-emerald-400 truncate max-w-[150px]">{selectedFile.name}</span> : 'Attach Forensic Evidence'}
            </button>
            {selectedFile && (
              <button 
                type="button" 
                onClick={() => setSelectedFile(null)}
                className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 tracking-tighter"
              >
                Discard
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanning || (!content && !selectedFile)}
            className={`flex items-center gap-3 px-10 py-3.5 rounded-xl font-black tracking-tight transition-all ${
              isScanning || (!content && !selectedFile)
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin" />
                <span className="animate-pulse">DECODING...</span>
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-5 h-5" />
                DEPLOY ANALYZER
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

export default ScannerForm;
