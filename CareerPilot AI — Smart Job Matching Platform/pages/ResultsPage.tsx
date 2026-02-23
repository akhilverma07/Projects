
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InterviewSessionData } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<InterviewSessionData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('career_pilot_sessions');
    if (saved) {
      const data: InterviewSessionData[] = JSON.parse(saved);
      const found = data.find(s => s.config.id === id);
      if (found) setSession(found);
    }
  }, [id]);

  if (!session || !session.evaluation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Evaluation not found.</p>
      </div>
    );
  }

  const evalData = session.evaluation;
  
  // Transform scores for chart
  const scoresData = Object.entries(evalData)
    .filter(([key]) => typeof evalData[key as keyof typeof evalData] === 'object' && key !== 'recruiterSummary')
    .map(([key, val]: [string, any]) => ({
      dimension: key.replace(/([A-Z])/g, ' $1').trim(),
      score: val.score || 0
    }));

  const overallPercent = Math.round(evalData.overallScore * 10);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fadeIn">
      <header className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
            <circle 
              cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * overallPercent) / 100}
              className="text-blue-600 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-blue-600">{overallPercent}%</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Readiness</span>
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{session.config.type}</span>
            <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{session.config.experience}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{session.config.role} Evaluation</h1>
          <p className="text-gray-500 italic">" {evalData.recruiterSummary} "</p>
        </div>
        <div className="flex-shrink-0 flex gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
          <Link to="/setup" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Retake Mock
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Score breakdown */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dimension Performance
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoresData} layout="vertical" margin={{ left: 60, right: 30 }}>
                  <XAxis type="number" hide domain={[0, 10]} />
                  <YAxis type="category" dataKey="dimension" tick={{ fontSize: 10, fontWeight: 500 }} width={120} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                    {scoresData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 8 ? '#10b981' : entry.score > 5 ? '#3b82f6' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Transcript Snippet */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Summary</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {session.chatHistory.map((turn, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${turn.role === 'interviewer' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                    {turn.role === 'interviewer' ? 'INT' : 'YOU'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">{turn.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Feedback */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 px-2">Actionable Insights</h3>
          {scoresData.map((d, idx) => {
            const key = Object.keys(evalData).find(k => k.replace(/([A-Z])/g, ' $1').trim().toLowerCase() === d.dimension.toLowerCase());
            if (!key) return null;
            const detail = evalData[key as keyof typeof evalData] as any;
            if (typeof detail !== 'object' || !detail.feedback) return null;

            return (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 text-sm capitalize">{d.dimension}</h4>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${detail.score > 8 ? 'bg-green-50 text-green-600' : detail.score > 5 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    {detail.score}/10
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{detail.feedback}</p>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">Growth Tip</span>
                  <p className="text-xs text-amber-800 italic">{detail.suggestion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
