import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

const Hero = () => {
  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden pb-12 pt-8 sm:min-h-[80vh] sm:pt-12 lg:min-h-[90vh] lg:pt-20">
      {/* Background Elements */}
      <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/10 blur-[90px] -z-10 sm:h-[36rem] sm:w-[36rem] lg:h-[50rem] lg:w-[50rem] lg:blur-[120px]" />
      <div className="absolute right-0 top-12 h-[16rem] w-[16rem] rounded-full bg-white/5 blur-[80px] -z-10 sm:top-20 sm:h-[22rem] sm:w-[22rem] lg:h-[25rem] lg:w-[25rem] lg:blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-red">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              New Collection 2026
            </div>
            <h1 className="max-w-[12ch] text-[3.25rem] font-black leading-[0.9] tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
              STEP INTO YOUR <br />
              <span className="text-brand-red">UNIQUENESS</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              With a legacy of 57+ years, we blend tradition with modern trends. Explore our footwear and clothing collections, designed to express your personality and elevate your lifestyle.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-4">
              <Link
                to="/products"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-red px-6 py-4 text-center font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-red-700 sm:w-auto sm:px-8 sm:tracking-widest"
              >
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-white/10 sm:w-auto sm:px-8 sm:tracking-widest"
              >
                Our Story
                <Play size={16} fill="currentColor" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8 sm:gap-8 sm:pt-12">
              <div>
                <p className="text-2xl font-black sm:text-3xl">57+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Years Experience</p>
              </div>
              <div>
                <p className="text-2xl font-black sm:text-3xl">10k+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Happy Clients</p>
              </div>
              <div>
                <p className="text-2xl font-black sm:text-3xl">500+</p>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Unique Designs</p>
              </div>
            </div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[34rem]"
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
            <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none text-[24vw] font-black tracking-tighter text-white/5 sm:text-[18vw] lg:text-[15vw]">
              LEGACY
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
