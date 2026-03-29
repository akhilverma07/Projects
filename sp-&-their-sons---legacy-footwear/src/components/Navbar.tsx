import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cartCount, wishlist } = useShop();
  const { user, logout, isAdmin } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group relative flex flex-col overflow-hidden rounded-2xl px-1 py-1 transition-transform duration-300 hover:scale-[1.03]"
          >
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-red/0 via-brand-red/10 to-brand-red/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative animate-[brand-bounce_1.2s_ease-in-out_infinite] text-[1.95rem] font-black uppercase tracking-[0.22em] text-white transition-transform duration-300 group-hover:scale-[1.04]">
              SP & THEIR SONS
            </span>
            <span className="relative text-[10px] font-bold uppercase tracking-[0.42em] text-brand-red transition-all duration-300 group-hover:tracking-[0.5em]">
              Legacy Since 1970
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-brand-red ${
                    isActive ? 'bg-brand-red/10 text-brand-red shadow-[0_0_24px_rgba(255,0,0,0.12)]' : 'text-white/70'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="rounded-full p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-brand-red">
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="relative rounded-full p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-brand-red">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative rounded-full p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-brand-red">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-brand-gray border border-white/10 rounded-2xl shadow-2xl p-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                          <p className="text-xs font-black text-white truncate">{user.name || 'User'}</p>
                          <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                          {isAdmin && <p className="text-[10px] text-brand-red uppercase tracking-widest mt-1">Admin</p>}
                        </div>
                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-brand-red hover:bg-white/5 rounded-xl transition-all"
                          >
                            <User size={16} />
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-brand-red hover:bg-white/5 rounded-xl transition-all"
                          >
                            <User size={16} />
                            My Dashboard
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-brand-red hover:bg-white/5 rounded-xl transition-all"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden rounded-full p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/5 hover:text-brand-red sm:block">
                  <User size={20} />
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              className="rounded-full p-2 transition-all duration-300 hover:bg-white/5 hover:text-brand-red md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-dark border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-4 text-base font-medium border-l-4 transition-all ${
                      isActive
                        ? 'bg-brand-red/10 border-brand-red text-brand-red'
                        : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  My Dashboard
                </Link>
              ) : null}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-4 text-base font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  Login / Account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
