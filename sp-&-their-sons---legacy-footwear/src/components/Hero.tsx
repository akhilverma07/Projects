import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-red">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              New Collection 2026
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
              STEP INTO YOUR <br />
              <span className="text-brand-red">UNIQUENESS</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              With a legacy of 57+ years, we blend tradition with modern trends. Explore our footwear and clothing collections, designed to express your personality and elevate your lifestyle.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/products"
                className="bg-brand-red text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-red-700 transition-all group"
              >
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-white/10 transition-all"
              >
                Our Story
                <Play size={16} fill="currentColor" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
              <div>
                <p className="text-3xl font-black">57+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-black">10k+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Happy Clients</p>
              </div>
              <div>
                <p className="text-3xl font-black">500+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Unique Designs</p>
              </div>
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <motion.img
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src="https://picsum.photos/seed/premium-sneaker/1000/1000"
                alt="Premium Sneaker"
                className="w-full h-auto drop-shadow-[0_35px_35px_rgba(255,0,0,0.3)]"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-white/5 select-none -z-10 tracking-tighter">
              LEGACY
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
