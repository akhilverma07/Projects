
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            CareerPilot AI
          </span>
        </Link>
        <div className="flex space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/setup" 
            className={`text-sm font-medium transition-colors ${isActive('/setup') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            New Interview
          </Link>
          <Link 
            to="/profile" 
            className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
          >
            Readiness Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
