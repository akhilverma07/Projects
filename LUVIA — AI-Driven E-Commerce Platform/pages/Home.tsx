
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const { scrollY } = useScroll();
  
  const textY = useTransform(scrollY, [0, 500], [0, 150]);
  const imgY = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    mockApi.getProducts().then(prods => {
      setTrending(prods.filter(p => p.isTrending).slice(0, 4));
    });
  }, []);

  return (
    <div className="bg-white">
      {/* 3D Parallax Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-100">
        <motion.div 
          style={{ y: imgY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1539109132304-399946ad962d?auto=format&fit=crop&w=2070&q=80" 
            alt="Hero Background"
            className="w-full h-full object-cover grayscale opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
        </motion.div>
        
        <div className="relative z-10 text-center px-6">
          <motion.div 
            style={{ y: textY, opacity }}
            className="perspective-1000"
          >
            <motion.p 
              initial={{ opacity: 0, z: -100 }}
              animate={{ opacity: 1, z: 0 }}
              transition={{ duration: 1 }}
              className="text-zinc-900 text-xs uppercase tracking-[1em] mb-8 font-bold"
            >
              Beyond the Surface
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, rotateX: -90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="text-zinc-900 text-6xl md:text-9xl font-serif mb-12 leading-none drop-shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              LUVIA<br/>
              <span className="text-4xl md:text-6xl italic tracking-widest opacity-40">Architectural Fashion</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link 
                to="/shop"
                className="group relative inline-flex items-center px-12 py-5 bg-zinc-900 text-white text-sm uppercase tracking-widest font-bold overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              >
                <span className="relative z-10 flex items-center">
                  Shop the Collection <ArrowRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-2" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3D Featured Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <motion.div 
             whileHover={{ scale: 0.98, rotateY: 5 }}
             className="relative h-[700px] bg-zinc-100 overflow-hidden shadow-2xl transition-all duration-700"
          >
            <Link to="/shop?cat=Womens" className="block w-full h-full group">
              <img 
                src="https://images.unsplash.com/photo-1494578379344-d6c710382a3d?auto=format&fit=crop&w=1200&q=80" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Women"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-16 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white text-5xl font-serif mb-6 transform transition-transform group-hover:-translate-y-4">Ethereal<br/>Womenswear</h3>
                <span className="text-white/60 text-xs tracking-[0.5em] uppercase font-bold border-b border-white/20 pb-2 w-fit">View Depth</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div 
             whileHover={{ scale: 0.98, rotateY: -5 }}
             className="relative h-[700px] bg-zinc-100 overflow-hidden shadow-2xl transition-all duration-700 mt-24"
          >
            <Link to="/shop?cat=Mens" className="block w-full h-full group">
              <img 
                src="https://images.unsplash.com/photo-1550991152-123c9a24424b?auto=format&fit=crop&w=1200&q=80" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Men"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-16 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white text-5xl font-serif mb-6 transform transition-transform group-hover:-translate-y-4">Structured<br/>Menswear</h3>
                <span className="text-white/60 text-xs tracking-[0.5em] uppercase font-bold border-b border-white/20 pb-2 w-fit">View Depth</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-32 bg-zinc-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-24 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl font-serif mb-6"
            >
              The Sculptural Edit
            </motion.h2>
            <div className="w-24 h-px bg-zinc-300" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ethos with 3D Float */}
      <section className="py-48 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="space-y-12"
            >
              <h2 className="text-6xl font-serif leading-tight">Crafting dimensions, not just garments.</h2>
              <p className="text-zinc-500 text-lg leading-loose">
                At LUVIA, we believe fashion is the intersection of architecture and movement. Each piece is engineered with spatial awareness, utilizing premium textiles that interact with light and shadow.
              </p>
              <button className="text-xs uppercase tracking-[0.4em] font-bold border-b-2 border-zinc-900 pb-2 hover:opacity-50 transition-opacity">
                Our Philosophy
              </button>
            </motion.div>
            <div className="relative perspective-2000">
               <motion.div 
                 animate={{ 
                   y: [0, -20, 0],
                   rotateX: [2, -2, 2],
                   rotateY: [-2, 2, -2]
                 }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 className="w-full aspect-square bg-zinc-100 shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden"
               >
                 <img 
                    src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80" 
                    className="w-full h-full object-cover"
                    alt="Fabric Detail"
                 />
               </motion.div>
               <motion.div 
                 animate={{ y: [0, 20, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -bottom-12 -left-12 w-64 h-64 bg-white p-4 shadow-2xl"
               >
                 <img 
                    src="https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80" 
                    className="w-full h-full object-cover"
                    alt="Detail"
                 />
               </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
