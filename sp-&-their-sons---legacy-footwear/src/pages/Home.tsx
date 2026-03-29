import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Clock, ShoppingBag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const Home = () => {
  const { products } = useProducts();
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);

  return (
    <div className="space-y-24 pb-24">
      <Hero />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over ₹150' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure transactions' },
            { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: Clock, title: '24/7 Support', desc: 'Dedicated support team' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-brand-gray border border-white/5 rounded-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-white">{feature.title}</h3>
              <p className="text-white/40 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Hot Right Now</span>
            <h2 className="text-4xl font-black tracking-tight">TRENDING COLLECTION</h2>
          </div>
          <Link to="/products" className="text-white/60 hover:text-brand-red transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-[800px] rounded-[3rem] overflow-hidden group shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1920&q=80"
            alt="Sale Banner"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent flex items-center">
            <div className="p-16 md:p-24 space-y-12 max-w-4xl">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotateZ: [-2, 2, -2],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                className="inline-block"
              >
                <span className="bg-brand-red text-white px-12 py-5 rounded-2xl text-xl font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(239,68,68,0.4)] border-b-4 border-red-800 transform -rotate-2">
                  Limited Time Offer
                </span>
              </motion.div>
              
              <div className="space-y-6">
                <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[1.15] tracking-tighter">
                  SEASONAL SALE <br />
                  <span className="text-brand-red">UP TO 50% OFF</span>
                </h2>
                <div className="flex flex-wrap gap-8 pt-4">
                  {[
                    { icon: ShieldCheck, text: 'Authentic Quality' },
                    { icon: Clock, text: 'Limited Stock' },
                    { icon: ArrowRight, text: 'New Arrivals', link: '/products' },
                    { icon: ShoppingBag, text: 'Shop for Sale', link: '/products', highlight: true }
                  ].map((feat, i) => {
                    const content = (
                      <>
                        <feat.icon size={20} className={`${feat.highlight ? 'text-white group-hover/feat:text-black' : 'text-brand-red'} group-hover/feat:scale-110 transition-transform`} />
                        <span className={`text-sm font-black uppercase tracking-widest ${feat.highlight ? '' : 'group-hover/feat:text-white'}`}>{feat.text}</span>
                      </>
                    );
                    const className = `flex items-center gap-3 backdrop-blur-md px-8 py-4 rounded-full border transition-all group/feat ${
                      feat.highlight 
                        ? 'bg-brand-red text-white border-brand-red shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:bg-white hover:text-black hover:border-white' 
                        : 'bg-white/5 text-white/80 border-white/10' + (feat.link ? ' hover:bg-brand-red/20 hover:border-brand-red/50' : '')
                    }`;

                    if (feat.link) {
                      return (
                        <Link key={i} to={feat.link} className={className}>
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={i} className={className}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-white/70 text-2xl leading-relaxed max-w-2xl">
                Don't miss out on our biggest sale of the year. Premium quality footwear at unbeatable prices. Experience the legacy of comfort and style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Curated For You</span>
          <h2 className="text-4xl font-black tracking-tight">FEATURED PRODUCTS</h2>
          <div className="w-20 h-1 bg-brand-red mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-block border border-white/10 text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Explore Full Collection
          </Link>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="bg-brand-gray py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Our Heritage</span>
              <h2 className="text-5xl font-black tracking-tighter leading-none">
                57+ YEARS OF <br />
                <span className="text-brand-red">CRAFTING LEGACY</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Established in the 1970s, SP & Their Sons has been at the forefront of footwear innovation for over five decades. What started as a small family workshop has grown into a symbol of quality and trust.
              </p>
              <div className="space-y-4">
                {[
                  'Handcrafted with precision',
                  'Premium quality materials',
                  'Legacy of trust and excellence',
                  'Modern designs, traditional values'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red">
                      <ShieldCheck size={12} />
                    </div>
                    <span className="text-white/80 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="inline-block text-brand-red font-bold uppercase tracking-widest text-sm border-b-2 border-brand-red pb-1 hover:text-white hover:border-white transition-all">
                Learn More About Us
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://picsum.photos/seed/shoemaker-legacy/800/1000"
                alt="Legacy Workshop"
                className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 bg-brand-red p-8 rounded-2xl shadow-xl hidden md:block">
                <p className="text-4xl font-black text-white">1970</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">ESTABLISHED</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
