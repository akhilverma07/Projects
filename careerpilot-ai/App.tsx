
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import { InterviewConfig } from './types';

const App: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<InterviewConfig | null>(null);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<InterviewSetup setConfig={setCurrentConfig} />} />
            <Route 
              path="/session" 
              element={currentConfig ? <InterviewSession config={currentConfig} /> : <Navigate to="/setup" />} 
            />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
