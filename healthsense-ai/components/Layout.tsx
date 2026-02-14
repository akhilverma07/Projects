
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'assessment', label: 'Risk Assessment' },
    { id: 'mental', label: 'Mental Wellness' },
    { id: 'support', label: 'Support & Coach' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => onViewChange('dashboard')}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tighter">
                HealthSense AI
              </span>
            </div>
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    currentView === item.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="md:hidden">
              {/* Mobile menu icon could go here, simplified for now */}
              <button className="p-2 text-slate-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2 opacity-50">
             <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center text-white text-[10px] font-bold">H</div>
             <span className="font-bold text-slate-400">HealthSense AI</span>
          </div>
          <p className="text-slate-400 text-xs text-center md:text-left max-w-md leading-relaxed">
            © 2025 HealthSense Clinical Intelligence. This platform uses Google Gemini 3 Flash for predictive modeling. Not a substitute for professional medical advice.
          </p>
          <div className="flex space-x-6 text-xs font-bold text-slate-400">
             <a href="#" className="hover:text-blue-600">Privacy</a>
             <a href="#" className="hover:text-blue-600">Clinical Data</a>
             <a href="#" className="hover:text-blue-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
