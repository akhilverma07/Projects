
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { cart, user, setIsCartOpen } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 -ml-2 text-zinc-900" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/shop" className="text-sm font-medium tracking-widest uppercase hover:text-zinc-500 transition-colors">Shop</Link>
          <Link to="/shop?cat=Mens" className="text-sm font-medium tracking-widest uppercase hover:text-zinc-500 transition-colors">Men</Link>
          <Link to="/shop?cat=Womens" className="text-sm font-medium tracking-widest uppercase hover:text-zinc-500 transition-colors">Women</Link>
        </div>

        {/* Brand */}
        <Link to="/" className="text-2xl font-bold tracking-[0.2em] uppercase lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          LUVIA
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-zinc-900 hover:text-zinc-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <Link to={user ? (user.role === UserRole.ADMIN ? "/admin" : "/profile") : "/auth"} className="p-2 text-zinc-900 hover:text-zinc-500 transition-colors relative">
            {user?.role === UserRole.ADMIN ? <Settings className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-zinc-900 hover:text-zinc-500 transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[60] p-10 flex flex-col"
            >
              <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-12">
                <X className="w-6 h-6" />
              </button>
              <nav className="flex flex-col space-y-8">
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="text-2xl font-serif">All Collection</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?cat=Mens" className="text-2xl font-serif">Menswear</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?cat=Womens" className="text-2xl font-serif">Womenswear</Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?cat=Accessories" className="text-2xl font-serif">Accessories</Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
