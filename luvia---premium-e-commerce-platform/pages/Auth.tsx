
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockApi } from '../services/mockApi';
import { useApp } from '../App';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await mockApi.login(email, password);
      setUser(user);
      navigate('/');
    } catch (err) {
      alert('Login failed. Use admin@luvia.com for admin access.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">{isLogin ? 'Sign In' : 'Create Account'}</h1>
          <p className="text-zinc-500 text-sm">Welcome back to the world of LUVIA.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 focus:border-zinc-900 outline-none transition-colors"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 focus:border-zinc-900 outline-none transition-colors"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest font-bold">Password</label>
              {isLogin && <button type="button" className="text-[10px] uppercase tracking-widest underline text-zinc-400">Forgot?</button>}
            </div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 focus:border-zinc-900 outline-none transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-zinc-900 text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-12 p-6 bg-zinc-50 rounded text-center text-xs text-zinc-400 leading-relaxed italic">
          Tip: Log in with <span className="font-bold text-zinc-600">admin@luvia.com</span> to access the management dashboard.
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
