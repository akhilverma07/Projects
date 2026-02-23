
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScannerForm from '../components/ScannerForm';
import RiskMeter from '../components/RiskMeter';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult, AnalysisType, ThreatLevel } from '../types';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  ShieldExclamationIcon,
  LightBulbIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';

const Scan: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (content: string, type: AnalysisType, file?: File) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      let imageData: { data: string; mimeType: string } | undefined;
      
      if (file) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
        });
        reader.readAsDataURL(file);
        const dataUrl = await promise;
        imageData = { data: dataUrl, mimeType: file.type };
      }

      const analysis = await analyzeContent(content, type, imageData);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || 'The security engine encountered an unrecoverable error during deep packet inspection.');
    } finally {
      setIsScanning(false);
    }
  };

  const getThreatIcon = (level: ThreatLevel) => {
    switch (level) {
      case ThreatLevel.SAFE: return <CheckCircleIcon className="w-8 h-8 text-emerald-500" />;
      case ThreatLevel.SUSPICIOUS: return <ExclamationCircleIcon className="w-8 h-8 text-amber-500" />;
      case ThreatLevel.DANGEROUS: return <ShieldExclamationIcon className="w-8 h-8 text-rose-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2"
        >
          Active Threat Protection
        </motion.div>
        <h1 className="text-6xl font-black tracking-tight text-white">
          Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Forensics</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Deep NLP inspection and behavioral profiling powered by PhishGuard's proprietary AI heuristics.
        </p>
      </header>

      <ScannerForm onScan={handleScan} isScanning={isScanning} />

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-4"
          >
            <ShieldExclamationIcon className="w-6 h-6 shrink-0" />
            <span className="font-semibold text-sm">{error}</span>
          </motion.div>
        )}

        {isScanning && !result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8 py-24"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldExclamationIcon className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-white mono uppercase">Heuristics Scan in Progress</h3>
              <p className="text-slate-500 text-sm font-medium">Checking behavioral patterns, psychological triggers, and lexical reputation...</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              <RiskMeter score={result.confidenceScore} level={result.threatLevel} />
              
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-5 flex items-center gap-2">
                  <LightBulbIcon className="w-4 h-4 text-blue-400" />
                  Security Protocol
                </h4>
                <p className="text-sm leading-relaxed text-slate-300 font-medium">
                  {result.recommendation}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${result.threatLevel === ThreatLevel.DANGEROUS ? 'bg-rose-500' : result.threatLevel === ThreatLevel.SUSPICIOUS ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                <div className="flex items-center gap-4 mb-8">
                  {getThreatIcon(result.threatLevel)}
                  <div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Threat Classification</span>
                    <h3 className="text-3xl font-black text-white">{result.fraudCategory}</h3>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Forensic Summary</h4>
                    <p className="text-slate-200 leading-relaxed text-lg font-medium">
                      {result.explanation}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">Detection Indicators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.indicators.map((indicator, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl hover:border-slate-700 transition-colors"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-sm ${result.threatLevel === ThreatLevel.DANGEROUS ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
                          <span className="text-sm text-slate-300 font-medium leading-tight">{indicator}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-8">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">Inspection Artifact (Source Text)</h4>
                 <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/50 text-slate-400 text-[13px] mono whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar leading-relaxed">
                    {result.rawInput || "[ SOURCE PAYLOAD IS BINARY OR IMAGE-ONLY ]"}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scan;
