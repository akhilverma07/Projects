
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobCategory, InterviewType, ExperienceLevel, CompanyType, InterviewConfig } from '../types';
import { JOB_ROLES_MAP, INTERVIEW_TYPES, EXPERIENCE_LEVELS, COMPANY_TYPES } from '../constants';

interface Props {
  setConfig: (config: InterviewConfig) => void;
}

const InterviewSetup: React.FC<Props> = ({ setConfig }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: JobCategory.SOFTWARE_IT,
    role: JOB_ROLES_MAP[JobCategory.SOFTWARE_IT][0],
    type: InterviewType.TECHNICAL,
    experience: ExperienceLevel.ENTRY,
    companyType: CompanyType.MNC,
    resumeText: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: InterviewConfig = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setConfig(config);
    navigate('/session');
  };

  const handleCategoryChange = (cat: JobCategory) => {
    setFormData({
      ...formData,
      category: cat,
      role: JOB_ROLES_MAP[cat][0]
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Set Your Career Pilot</h1>
        <p className="text-lg text-gray-600">Customize your simulation to match your target job and company.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Job Category</label>
              <select 
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value as JobCategory)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {Object.values(JobCategory).map(cat => (
                  <option key={cat} value={cat} className="text-gray-900">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {JOB_ROLES_MAP[formData.category].map(role => (
                  <option key={role} value={role} className="text-gray-900">{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Interview Focus</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as InterviewType})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {INTERVIEW_TYPES.map(type => (
                  <option key={type} value={type} className="text-gray-900">{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
              <select 
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value as ExperienceLevel})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level} value={level} className="text-gray-900">{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Company Environment</label>
              <select 
                value={formData.companyType}
                onChange={(e) => setFormData({...formData, companyType: e.target.value as CompanyType})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                {COMPANY_TYPES.map(type => (
                  <option key={type} value={type} className="text-gray-900">{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Resume Context (Optional)</label>
              <textarea 
                placeholder="Paste key points from your resume for personalized questions..."
                value={formData.resumeText}
                onChange={(e) => setFormData({...formData, resumeText: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 h-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulation lasts approx. 10-15 minutes
          </div>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center"
          >
            Launch Interview
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
