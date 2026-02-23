
import React from 'react';
import { motion } from 'framer-motion';
import { ThreatLevel } from '../types';

interface RiskMeterProps {
  score: number;
  level: ThreatLevel;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, level }) => {
  const getColor = () => {
    switch (level) {
      case ThreatLevel.SAFE: return 'text-emerald-400';
      case ThreatLevel.SUSPICIOUS: return 'text-amber-400';
      case ThreatLevel.DANGEROUS: return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const getBgColor = () => {
    switch (level) {
      case ThreatLevel.SAFE: return 'bg-emerald-400/20';
      case ThreatLevel.SUSPICIOUS: return 'bg-amber-400/20';
      case ThreatLevel.DANGEROUS: return 'bg-rose-500/20';
      default: return 'bg-slate-400/20';
    }
  };

  const getBorderColor = () => {
    switch (level) {
      case ThreatLevel.SAFE: return 'border-emerald-500/30';
      case ThreatLevel.SUSPICIOUS: return 'border-amber-500/30';
      case ThreatLevel.DANGEROUS: return 'border-rose-500/30';
      default: return 'border-slate-500/30';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border ${getBorderColor()} ${getBgColor()} backdrop-blur-sm`}>
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={502.6}
            initial={{ strokeDashoffset: 502.6 }}
            animate={{ strokeDashoffset: 502.6 - (502.6 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-bold mono ${getColor()}`}
          >
            {score}%
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">Confidence</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <h3 className={`text-2xl font-bold uppercase tracking-tight ${getColor()}`}>
          {level}
        </h3>
        <p className="text-sm text-slate-400 mt-1">Threat Level Assessment</p>
      </div>
    </div>
  );
};

export default RiskMeter;
