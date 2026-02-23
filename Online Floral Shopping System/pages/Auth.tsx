
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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
      alert('Login failed. Use admin@flowerstore.com for admin access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-24 bg-zinc-50 relative">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl border border-zinc-100 relative"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-[#e84393] hover:bg-zinc-50 rounded-full transition-all"
          aria-label="Close and return to home"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4 text-zinc-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-500 text-sm">Join the <span className="text-[#e84393] font-bold">FLOWER STORE</span> community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:border-[#e84393] focus:ring-1 focus:ring-[#e84393]/20 outline-none transition-all"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:border-[#e84393] focus:ring-1 focus:ring-[#e84393]/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Password</label>
              {isLogin && <button type="button" className="text-[10px] uppercase tracking-widest underline text-[#e84393]">Forgot?</button>}
            </div>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-xl focus:border-[#e84393] focus:ring-1 focus:ring-[#e84393]/20 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-[#e84393] text-white text-sm font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg hover:shadow-[#e84393]/30 hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Wait a moment...' : (isLogin ? 'Sign In' : 'Join Now')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-[#e84393] transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already a member? Sign in"}
          </button>
        </div>

        <div className="mt-12 p-6 bg-zinc-50 rounded-2xl text-center text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest border border-dashed border-zinc-200">
          Admin access: <span className="text-[#e84393] font-bold">admin@flowerstore.com</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
