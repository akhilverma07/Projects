
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InterviewSessionData } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<InterviewSessionData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('career_pilot_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  const getStats = () => {
    if (sessions.length === 0) return null;
    const completed = sessions.filter(s => s.status === 'completed' && s.evaluation);
    if (completed.length === 0) return null;

    const avgScore = completed.reduce((acc, s) => acc + (s.evaluation?.overallScore || 0), 0) / completed.length;
    
    // Skill gap analysis (dummy data for visual)
    const skillsData = [
      { subject: 'Technical', A: 85, fullMark: 100 },
      { subject: 'Behavioral', A: 70, fullMark: 100 },
      { subject: 'Communication', A: 90, fullMark: 100 },
      { subject: 'Leadership', A: 65, fullMark: 100 },
      { subject: 'Problem Solving', A: 80, fullMark: 100 },
    ];

    return { avgScore, skillsData };
  };

  const stats = getStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back, Professional</h1>
          <p className="text-gray-500">Track your interview readiness and refine your skills.</p>
        </div>
        <Link 
          to="/setup" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-center"
        >
          Start Mock Interview
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Overall Readiness</span>
          <div className="text-5xl font-black text-blue-600 my-2">
            {stats ? Math.round(stats.avgScore * 10) : 0}%
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000" 
              style={{ width: `${stats ? stats.avgScore * 10 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Skill Dimension Analysis</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats?.skillsData || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No sessions found. Start your first interview to see history.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Link 
                key={session.config.id} 
                to={`/results/${session.config.id}`}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all hover:shadow-md group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase">
                    {session.config.type}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(session.config.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {session.config.role}
                </h4>
                <p className="text-sm text-gray-500 mb-4">{session.config.category}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm">
                    <span className="text-gray-400">Score:</span>
                    <span className="ml-1 font-bold text-gray-800">
                      {session.evaluation ? `${Math.round(session.evaluation.overallScore * 10)}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )).reverse()}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
