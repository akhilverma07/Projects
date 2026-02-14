
import React from 'react';
import { ResumeData } from '../types';
import { FileText, Calendar, ChevronRight, Search, Trash2 } from 'lucide-react';

interface HistoryProps {
  resumes: ResumeData[];
  onSelectResume: (resume: ResumeData) => void;
}

export const History: React.FC<HistoryProps> = ({ resumes, onSelectResume }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Analysis History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view your previously optimized resumes.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search history..."
            className="pl-12 pr-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-sm font-semibold border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4">Resume Version</th>
              <th className="px-6 py-4">Date Created</th>
              <th className="px-6 py-4">ATS Score</th>
              <th className="px-6 py-4">Skills</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredResumes.map((resume) => (
              <tr 
                key={resume.id} 
                className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors cursor-pointer group"
                onClick={() => onSelectResume(resume)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold dark:text-white">{resume.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{resume.fullName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Calendar size={14} />
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-full max-w-[60px] bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${resume.atsScore}%` }} />
                    </div>
                    <span className="text-sm font-bold dark:text-white">{resume.atsScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    {resume.skills.slice(0, 3).map((skill, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {skill[0]}
                      </div>
                    ))}
                    {resume.skills.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                        +{resume.skills.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredResumes.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500 dark:text-slate-400 italic">No matching resumes found in your history.</p>
          </div>
        )}
      </div>
    </div>
  );
};
