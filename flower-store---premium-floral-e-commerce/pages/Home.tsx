
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Quote, Mail, Phone } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    mockApi.getProducts().then(prods => {
      // Sort by createdAt descending and take only the top 6
      const sorted = [...prods].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestProducts(sorted.slice(0, 6));
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://media.istockphoto.com/id/1895175524/photo/flower-arrangement.jpg?b=1&s=612x612&w=0&k=20&c=DU5OnwWDqmpuJW26tBC17Unso-eQhz3qPtZOf3cUPl8=" 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h3 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-4 drop-shadow-lg">
              Fresh Flower
            </h3>
            <span className="text-[#e84393] text-3xl md:text-5xl font-bold block mb-8">
              Natural & Beautiful Flowers
            </span>
            <p className="text-zinc-200 text-lg leading-relaxed mb-10 max-w-xl">
              Experience the breath of nature with our hand-picked, premium floral collections. 
              Delivered fresh to your doorstep with love and care.
            </p>
            <Link to="/shop" className="btn-primary">Shop Now</Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-serif text-center mb-16 text-zinc-800">
            <span className="text-[#e84393]">About</span> Us
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative group perspective-1000">
              <motion.div 
                whileHover={{ rotateY: 5, scale: 1.02 }}
                className="rounded-2xl overflow-hidden shadow-2xl border-[1.5rem] border-white"
              >
                <video 
                  src="https://videos.pexels.com/video-files/3127074/3127074-sd_640_360_24fps.mp4" 
                  loop autoPlay muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <h3 className="bg-white/90 backdrop-blur-md text-zinc-800 text-2xl font-bold px-8 py-4 rounded-lg shadow-xl group-hover:text-[#e84393] transition-colors">
                     Best Flower Sellers
                   </h3>
                </div>
              </motion.div>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-4xl font-bold text-zinc-800">Why Choose Us?</h3>
              <p className="text-zinc-600 text-lg leading-relaxed">
                We believe that every flower tells a story. Our team of expert florists meticulously 
                curates each arrangement to ensure it captures the emotion and beauty of your special moment.
              </p>
              <p className="text-zinc-600 text-lg leading-relaxed">
                From eco-friendly sourcing to sustainable packaging, we are committed to providing 
                the highest quality flora while respecting the environment.
              </p>
              <button className="btn-primary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Icons Section */}
      <section className="py-20 bg-zinc-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { img: 'https://cdn-icons-png.flaticon.com/128/5465/5465858.png', title: 'Free Delivery', sub: 'On all Orders' },
            { img: 'https://cdn-icons-png.flaticon.com/128/4989/4989753.png', title: '10 days return', sub: 'Money-back Guarantee' },
            { img: 'https://cdn-icons-png.flaticon.com/128/1139/1139982.png', title: 'Offer & Gifts', sub: 'On all orders' },
            { img: 'https://cdn-icons-png.flaticon.com/128/10188/10188159.png', title: 'Secure Payment', sub: 'Protected By Google Pay' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-xl shadow-lg border-2 border-transparent hover:border-[#e84393]/20 flex items-center gap-6"
            >
              <img src={item.img} className="w-16 h-16 object-contain" alt="" />
              <div>
                <h3 className="text-xl font-bold text-zinc-800">{item.title}</h3>
                <span className="text-zinc-500 text-sm font-medium">{item.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-[1550px] mx-auto px-6">
          <h1 className="text-5xl font-serif text-center mb-16 text-zinc-800">
            Latest <span className="text-[#e84393]">Products</span>
          </h1>
          {/* Enhanced Grid: 2 cols mobile, 3 tablet, 6 xl desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-8">
            {latestProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-20">
            <Link to="/shop?cat=All" className="btn-primary flex items-center gap-3 mx-auto w-fit">
              View Our Collection <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section id="review" className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-serif text-center mb-16 text-zinc-800">
            Customer's <span className="text-[#e84393]">Review</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'John Deo', img: 'https://images.pexels.com/photos/30947676/pexels-photo-30947676/free-photo-of-moody-portrait-of-tattooed-man-in-dark-setting.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Smith K.', img: 'https://images.pexels.com/photos/30923365/pexels-photo-30923365/free-photo-of-bearded-man-in-colorful-turban-smoking.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Sarah J.', img: 'https://images.pexels.com/photos/30956582/pexels-photo-30956582/free-photo-of-smiling-woman-in-yellow-sweater-and-red-beanie.jpeg?auto=compress&cs=tinysrgb&w=800' }
            ].map((user, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.03 }}
                className="bg-white p-10 rounded-2xl shadow-xl relative border-4 border-zinc-100"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-[#e84393] text-[#e84393]" />)}
                </div>
                <p className="text-zinc-600 leading-relaxed mb-8 italic">
                  "Absolutely breathtaking arrangements. The flowers stayed fresh for over two weeks! 
                  The delivery was prompt and the packaging was very secure. Highly recommend!"
                </p>
                <div className="flex items-center gap-4">
                  <img src={user.img} className="w-14 h-14 rounded-full object-cover border-2 border-[#e84393]" alt="" />
                  <div>
                    <h3 className="font-bold text-zinc-800 text-lg">{user.name}</h3>
                    <span className="text-[#e84393] text-sm uppercase font-bold tracking-widest">Happy Customer</span>
                  </div>
                </div>
                <Quote className="absolute bottom-6 right-6 w-12 h-12 text-zinc-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-serif text-center mb-16 text-zinc-800">
            <span className="text-[#e84393]">Contact</span> Us
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <motion.form 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="bg-white p-10 rounded-2xl shadow-2xl border border-zinc-100 space-y-6"
               onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}
             >
                <input type="text" placeholder="Your Name" required className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-[#e84393] transition-all" />
                <input type="email" placeholder="Your Email" required className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-[#e84393] transition-all" />
                <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-[#e84393] transition-all" />
                <textarea placeholder="Your Message" rows={5} required className="w-full px-6 py-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-[#e84393] transition-all resize-none"></textarea>
                <button type="submit" className="btn-primary w-full">Send Message</button>
             </motion.form>
             
             <div className="space-y-12">
                <div className="overflow-hidden rounded-2xl shadow-2xl">
                   <img 
                    src="https://images.pexels.com/photos/7881305/pexels-photo-7881305.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    className="w-full h-[400px] object-cover" 
                    alt="Contact" 
                   />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-zinc-600">
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-[#e84393]/10 rounded-full text-[#e84393]"><Phone /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Call Us</p>
                        <p className="font-bold">+123-456-7890</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="p-4 bg-[#e84393]/10 rounded-full text-[#e84393]"><Mail /></div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email Us</p>
                        <p className="font-bold">hello@flowerstore.com</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
