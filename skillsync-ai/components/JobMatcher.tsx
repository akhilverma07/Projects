
import React from 'react';
import { ResumeData, JobMatchResult } from '../types';
import { 
  Target, 
  Search, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { matchJobDescription } from '../services/geminiService';

interface JobMatcherProps {
  currentResume: ResumeData | null;
  onMatchComplete: (result: JobMatchResult) => void;
}

export const JobMatcher: React.FC<JobMatcherProps> = ({ currentResume, onMatchComplete }) => {
  const [jobDesc, setJobDesc] = React.useState('');
  const [isMatching, setIsMatching] = React.useState(false);
  const [result, setResult] = React.useState<JobMatchResult | null>(null);

  const handleMatch = async () => {
    if (!currentResume) return;
    if (!jobDesc.trim()) return;

    setIsMatching(true);
    try {
      const matchResult = await matchJobDescription(currentResume, jobDesc);
      setResult(matchResult);
      onMatchComplete(matchResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMatching(false);
    }
  };

  if (!currentResume) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold dark:text-white">No Resume Found</h2>
        <p className="text-slate-500 max-w-sm">You need to analyze a resume before you can match it against job descriptions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Job Description Matcher</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">See how well you fit for your dream role.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100 dark:border-indigo-800">
          <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">Targeting:</span>
          <span className="text-sm font-bold dark:text-white">{currentResume.fullName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-white">Role Description</h3>
            <button 
              onClick={() => setJobDesc("Senior Frontend Engineer\nRequired: React, TypeScript, Tailwind, 5+ years experience, Node.js knowledge, and experience with modern AI APIs.")}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Paste Sample
            </button>
          </div>
          <textarea
            className="w-full h-80 px-6 py-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-6"
            placeholder="Paste the job description or role requirements here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
          <button
            onClick={handleMatch}
            disabled={isMatching || !jobDesc.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 group"
          >
            {isMatching ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <Target className="group-hover:scale-110 transition-transform" />
            )}
            {isMatching ? 'Matching...' : 'Run Analysis Engine'}
          </button>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {result ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              {/* Score card */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="flex items-center justify-between relative">
                  <div>
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Compatibility Score</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-indigo-600">{result.matchScore}%</span>
                      <span className="text-slate-400 font-medium">match</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-8 border-slate-100 dark:border-slate-700 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="40" cy="40" r="32" 
                        fill="none" stroke="currentColor" strokeWidth="8"
                        className="text-indigo-600"
                        strokeDasharray="201"
                        strokeDashoffset={201 - (201 * result.matchScore) / 100}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <Zap className="text-indigo-600" size={24} />
                  </div>
                </div>
              </div>

              {/* Skills overlap */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <h4 className="font-bold dark:text-white mb-6 flex items-center gap-2">
                  <Search size={20} className="text-indigo-600" />
                  Skills Comparison
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Matching Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchingSkills.length > 0 ? result.matchingSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={14} /> {skill}
                        </span>
                      )) : <span className="text-slate-400 text-sm">No direct skill matches found.</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Gaps Identified</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.length > 0 ? result.missingSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 flex items-center gap-1">
                          <XCircle size={14} /> {skill}
                        </span>
                      )) : <span className="text-slate-400 text-sm">No significant skill gaps found.</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Lightbulb size={20} />
                  How to Improve
                </h4>
                <ul className="space-y-3">
                  {result.optimizationTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-indigo-100 leading-relaxed">
                      <ArrowRight size={16} className="shrink-0 mt-0.5 opacity-60" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <Target size={32} />
              </div>
              <h3 className="font-bold text-slate-400">Ready for Analysis</h3>
              <p className="text-sm text-slate-400 max-w-xs mt-2">Paste a job description and run the engine to see how your current resume stacks up.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
