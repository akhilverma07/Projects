
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';

const HistoryPlaceholder = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold">No History Found</h2>
    <p>Your previous scan results will appear here once you start scanning content.</p>
  </div>
);

const ThreatIntelPlaceholder = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Threat Intelligence Feed</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[1, 2, 3].map(i => (
         <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse">
           <div className="h-4 w-1/2 bg-slate-800 rounded mb-4" />
           <div className="h-24 bg-slate-800 rounded mb-4" />
           <div className="h-4 w-1/4 bg-slate-800 rounded" />
         </div>
       ))}
    </div>
    <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
      <p className="text-slate-500">Live global threat intelligence integration coming in v2.5.0</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/history" element={<HistoryPlaceholder />} />
        <Route path="/threats" element={<ThreatIntelPlaceholder />} />
        <Route path="/help" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Documentation Hub</h1><p className="text-slate-500 mt-2">Security resources and guides are currently being indexed.</p></div>} />
      </Routes>
    </Layout>
  );
};

export default App;
