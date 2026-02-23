
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Settings, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { cart, wishlist, user, setIsCartOpen } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-white py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-zinc-900" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-2xl font-black tracking-tighter text-zinc-800 uppercase flex items-center">
            FLOWER <span className="text-[#e84393] ml-1">STORE</span>
          </Link>
        </div>

        {/* Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-10">
          <a href="#home" onClick={(e) => handleSectionClick(e, 'home')} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-[#e84393]">Home</a>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-[#e84393]">Products</Link>
          <a href="#about" onClick={(e) => handleSectionClick(e, 'about')} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-[#e84393]">About</a>
          <a href="#review" onClick={(e) => handleSectionClick(e, 'review')} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-[#e84393]">Review</a>
          <a href="#contact" onClick={(e) => handleSectionClick(e, 'contact')} className="text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-[#e84393]">Contact</a>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-2 md:space-x-5">
          <Link to="/wishlist" className="p-2 text-zinc-800 hover:text-[#e84393] relative">
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#e84393] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>
          
          <Link to={user ? (user.role === UserRole.ADMIN ? "/admin" : "/profile") : "/auth"} className="p-2 text-zinc-800 hover:text-[#e84393]">
            {user?.role === UserRole.ADMIN ? <Settings className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-zinc-800 hover:text-[#e84393] relative"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#e84393] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-white z-[60] p-10 flex flex-col shadow-2xl"
            >
              <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-10"><X className="w-8 h-8" /></button>
              <nav className="flex flex-col space-y-6">
                <a onClick={(e) => handleSectionClick(e, 'home')} href="#home" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">Home</a>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">Products</Link>
                <a onClick={(e) => handleSectionClick(e, 'about')} href="#about" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">About</a>
                <a onClick={(e) => handleSectionClick(e, 'review')} href="#review" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">Review</a>
                <a onClick={(e) => handleSectionClick(e, 'contact')} href="#contact" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">Contact</a>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/wishlist" className="text-xl font-bold uppercase text-zinc-800 border-b pb-2">Wishlist</Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
