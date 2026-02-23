
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <p className="text-slate-500 text-sm mb-2">
          &copy; {new Date().getFullYear()} PolyLingo AI. Powered by Google Gemini AI.
        </p>
        <div className="flex items-center justify-center gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Contact Support</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
