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
    <div className="space-y-16 pb-24 sm:space-y-20 md:space-y-24">
      <Hero />

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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
              className="flex flex-col items-center space-y-4 rounded-2xl border border-white/5 bg-brand-gray p-6 text-center sm:p-8"
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
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Hot Right Now</span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">TRENDING COLLECTION</h2>
          </div>
          <Link to="/products" className="text-white/60 hover:text-brand-red transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {trendingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Sale Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="group relative min-h-[34rem] overflow-hidden rounded-[2rem] shadow-2xl sm:min-h-[42rem] sm:rounded-[2.5rem] lg:h-[800px] lg:rounded-[3rem]">
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1920&q=80"
            alt="Sale Banner"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black via-black/70 to-transparent">
            <div className="max-w-4xl space-y-8 p-6 sm:p-10 md:p-16 lg:space-y-12 lg:p-24">
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
                <span className="inline-block rounded-2xl border-b-4 border-red-800 bg-brand-red px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transform -rotate-2 sm:px-8 sm:py-4 sm:text-base md:px-12 md:py-5 md:text-xl md:tracking-[0.3em]">
                  Limited Time Offer
                </span>
              </motion.div>
              
              <div className="space-y-6">
                <h2 className="text-4xl font-black leading-[1.02] tracking-tighter sm:text-6xl md:text-7xl lg:text-9xl">
                  SEASONAL SALE <br />
                  <span className="text-brand-red">UP TO 50% OFF</span>
                </h2>
                <div className="flex flex-wrap gap-3 pt-2 sm:gap-4 lg:gap-8 lg:pt-4">
                  {[
                    { icon: ShieldCheck, text: 'Authentic Quality' },
                    { icon: Clock, text: 'Limited Stock' },
                    { icon: ArrowRight, text: 'New Arrivals', link: '/products' },
                    { icon: ShoppingBag, text: 'Shop for Sale', link: '/products', highlight: true }
                  ].map((feat, i) => {
                    const content = (
                      <>
                        <feat.icon size={20} className={`${feat.highlight ? 'text-white group-hover/feat:text-black' : 'text-brand-red'} group-hover/feat:scale-110 transition-transform`} />
                      <span className={`text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-widest ${feat.highlight ? '' : 'group-hover/feat:text-white'}`}>{feat.text}</span>
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

              <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl lg:text-2xl">
                Don't miss out on our biggest sale of the year. Premium quality footwear at unbeatable prices. Experience the legacy of comfort and style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center sm:mb-16">
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Curated For You</span>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">FEATURED PRODUCTS</h2>
          <div className="w-20 h-1 bg-brand-red mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-block rounded-full border border-white/10 px-8 py-4 font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-white/5 sm:px-12 sm:tracking-widest"
          >
            Explore Full Collection
          </Link>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="border-y border-white/5 bg-brand-gray py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Our Heritage</span>
              <h2 className="text-4xl font-black leading-none tracking-tighter sm:text-5xl">
                57+ YEARS OF <br />
                <span className="text-brand-red">CRAFTING LEGACY</span>
              </h2>
              <p className="text-base leading-relaxed text-white/60 sm:text-lg">
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
              <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-brand-red p-6 shadow-xl md:block lg:-bottom-8 lg:-left-8 lg:p-8">
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
