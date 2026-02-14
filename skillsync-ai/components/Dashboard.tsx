
import React from 'react';
import { ResumeData, View } from '../types';
import { 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  FileText,
  Tag
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  resumes: ResumeData[];
  onViewChange: (view: View) => void;
  onSelectResume: (resume: ResumeData) => void;
}

const mockChartData = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 68 },
  { name: 'Wed', score: 75 },
  { name: 'Thu', score: 72 },
  { name: 'Fri', score: 85 },
  { name: 'Sat', score: 88 },
  { name: 'Sun', score: 92 },
];

export const Dashboard: React.FC<DashboardProps> = ({ resumes, onViewChange, onSelectResume }) => {
  const latestResume = resumes[resumes.length - 1];

  // Extract all unique skills across all resumes for the tag cloud
  const allSkills = Array.from(new Set(resumes.flatMap(r => r.skills)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Professional Portfolio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your optimization trends and skill profile.</p>
        </div>
        <button
          onClick={() => onViewChange('ANALYZER')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle size={20} />
          New Resume Analysis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Peak ATS Score</p>
              <h3 className="text-2xl font-bold dark:text-white">{latestResume?.atsScore || 0}%</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${latestResume?.atsScore || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Skills Identified</p>
              <h3 className="text-2xl font-bold dark:text-white">{allSkills.length}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">Across {resumes.length} resume versions</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Optimizations</p>
              <h3 className="text-2xl font-bold dark:text-white">{resumes.length}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">Sessions recorded</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6 dark:text-white">Optimization Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Skills Tag Cloud */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Tag size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold dark:text-white">Skill Map</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.length > 0 ? allSkills.slice(0, 20).map((skill, i) => (
              <span 
                key={i} 
                className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-100 dark:border-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-default"
              >
                {skill}
              </span>
            )) : (
              <p className="text-sm text-slate-500 italic py-4">Upload a resume to see your skill map.</p>
            )}
            {allSkills.length > 20 && (
              <span className="text-xs text-slate-500 mt-2">+{allSkills.length - 20} more</span>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold dark:text-white">Recent Analyses</h3>
            <button onClick={() => onViewChange('HISTORY')} className="text-indigo-600 text-sm font-medium hover:underline">View All History</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.slice(-3).reverse().map((resume) => (
              <div 
                key={resume.id} 
                onClick={() => onSelectResume(resume)}
                className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-500">
                    <FileText className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold dark:text-white truncate max-w-[150px]">{resume.title}</h4>
                    <p className="text-xs text-slate-500">{new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-emerald-600">{resume.atsScore}%</span>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
            {resumes.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-500 text-sm italic">You haven't analyzed any resumes yet. Start now to see your history!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
