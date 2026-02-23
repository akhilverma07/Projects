
import React from 'react';
import { View, User, ResumeData, AppState, JobMatchResult } from './types';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { JobMatcher } from './components/JobMatcher';
import { History } from './components/History';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>(() => {
    const saved = localStorage.getItem('skillSyncState');
    if (saved) return JSON.parse(saved);
    return {
      view: 'LANDING',
      user: null,
      resumes: [],
      currentResume: null,
      analysisResults: null
    };
  });

  React.useEffect(() => {
    localStorage.setItem('skillSyncState', JSON.stringify(state));
  }, [state]);

  const setView = (view: View) => setState(prev => ({ ...prev, view }));
  const handleAuth = (user: User) => setState(prev => ({ ...prev, user, view: 'DASHBOARD' }));
  const handleLogout = () => {
    localStorage.removeItem('skillSyncState');
    setState({ view: 'LANDING', user: null, resumes: [], currentResume: null, analysisResults: null });
  };

  const handleAnalysisComplete = (data: ResumeData) => {
    setState(prev => ({
      ...prev,
      resumes: [...prev.resumes, data],
      currentResume: data,
      view: 'MATCHER'
    }));
  };

  const handleMatchComplete = (result: JobMatchResult) => {
    setState(prev => ({ ...prev, analysisResults: result }));
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SkillSync AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">API</a>
          </div>
          <button 
            onClick={() => setView('AUTH')}
            className="px-6 py-2.5 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8 animate-bounce">
            <Zap size={16} /> Now powered by Gemini 3 Flash
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Sync Your Skills With <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              High-Value Roles.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The AI-powered platform that decodes job descriptions and aligns your profile for maximum ATS visibility. Get matched, not rejected.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setView('AUTH')}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-2 group transition-all"
            >
              Analyze Your Resume <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-lg border border-white/10 transition-all">
              See Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-indigo-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">ATS Compliance</h3>
              <p className="text-slate-400 leading-relaxed">Ensure your resume passes through major Applicant Tracking Systems with keyword density analysis.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all group">
              <div className="w-14 h-14 bg-violet-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-violet-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Semantic Matching</h3>
              <p className="text-slate-400 leading-relaxed">NLP-based matching that understands your experience beyond just buzzwords.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Role Optimization</h3>
              <p className="text-slate-400 leading-relaxed">Get specific advice for roles like Software Engineer, Product Manager, or Data Scientist.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500" />
            <span className="font-bold text-lg">SkillSync AI</span>
          </div>
          <div className="text-slate-500 text-sm">© 2024 SkillSync AI. Built for the modern job seeker.</div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white">GitHub</a>
            <a href="#" className="text-slate-500 hover:text-white">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderView = () => {
    switch (state.view) {
      case 'DASHBOARD':
        return <Dashboard 
                  resumes={state.resumes} 
                  onViewChange={setView} 
                  onSelectResume={(resume) => setState(prev => ({ ...prev, currentResume: resume, view: 'MATCHER' }))} 
                />;
      case 'ANALYZER':
        return <ResumeAnalyzer onAnalysisComplete={handleAnalysisComplete} />;
      case 'MATCHER':
        return <JobMatcher currentResume={state.currentResume} onMatchComplete={handleMatchComplete} />;
      case 'HISTORY':
        return <History 
                  resumes={state.resumes} 
                  onSelectResume={(resume) => setState(prev => ({ ...prev, currentResume: resume, view: 'MATCHER' }))} 
                />;
      default:
        return <Dashboard resumes={state.resumes} onViewChange={setView} onSelectResume={() => {}} />;
    }
  };

  if (state.view === 'LANDING') return <LandingPage />;
  if (state.view === 'AUTH') return <Auth onAuthSuccess={handleAuth} onSwitchToLanding={() => setView('LANDING')} />;

  return (
    <Layout 
      currentView={state.view} 
      setView={setView} 
      user={state.user} 
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
