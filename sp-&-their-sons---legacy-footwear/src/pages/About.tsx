import React from 'react';
import { motion } from 'motion/react';
import { History, Target, Users, Award, ShieldCheck, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/shoemaking-history/1920/1080?grayscale"
          alt="Legacy Workshop"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-red text-sm font-black uppercase tracking-[0.4em]"
          >
            Our Legacy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter"
          >
            CRAFTING EXCELLENCE <br />
            <span className="text-brand-red">SINCE 1970</span>
          </motion.h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tight">THE SP & THEIR SONS STORY</h2>
            <div className="space-y-6 text-white/60 leading-relaxed text-lg">
              <p>
                SP & Their Sons Company was established in 1970 under the name Sheetal Prasad Verma Vastra Vikreta. From the very beginning, our shop has been dedicated to clothing and started as a complete cloth store offering a wide range of fabrics and garments.
              </p>
              <p>
                The foundation of this business was laid by Late Mr. Sheetal Prasad Verma and his wife Late Mrs. Foola Devi, whose dedication, hard work, and vision built the roots of what we proudly carry forward today. Their invaluable contributions and sacrifices will always remain unforgettable, and this journey stands as a tribute to their legacy.
              </p>
              <p>
                Over time, we expanded into a full wholesale and retail clothing business, providing all types of clothes including traditional wear, daily wear, seasonal collections, and readymade garments for men, women, and children. With years of trust and experience, we have become a reliable destination for both individual customers and bulk buyers looking for quality clothing at the best value.
              </p>
              <p>
                As our business grew, we introduced a dedicated footwear section in our shop. Today, we offer a wide variety of footwear including casual shoes, formal shoes, slippers, sandals, and daily-use footwear for all age groups. Our focus is on providing comfortable, durable, and stylish footwear that meets the needs of every customer.
              </p>
              <p>
                In addition to clothing and footwear, our shop also provides agriculture-related products such as fertilizers including urea, DAP, and other essential farming items. We support farmers through schemes like PM Kisan Nidhi and PM Shram Yojana, along with other agriculture-related assistance.
              </p>
              <p>
                We also run a CSE (Cyber Cafe) center, offering Aadhaar card registration and updates, PAN card services, LIC services, passport-related services, and various Indian government services.
              </p>
              <p>
                Furthermore, we provide banking-related services, including HDFC Bank and other bank-related work.
              </p>
              <p>
                Our mission is to serve our community by offering quality clothing, reliable footwear, and essential services all under one roof, built on trust since 1970, and inspired by the values of our founders.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                  <History size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">57+ Years</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Of Trusted Service</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Wholesale & Retail</h4>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Serving Every Customer</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-brand-red/20 rounded-3xl blur-2xl -z-10" />
            <img
              src="https://picsum.photos/seed/shoemaker-craft/800/1000"
              alt="Craftsmanship"
              className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-brand-gray py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 bg-brand-dark rounded-3xl border border-white/5 space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center text-white">
                <Target size={32} />
              </div>
              <h3 className="text-3xl font-black tracking-tight">OUR MISSION</h3>
              <p className="text-white/60 leading-relaxed">
                To serve our community with quality clothing, reliable footwear, agriculture essentials, and important daily services under one roof. We aim to make trust, value, and convenience part of every customer experience.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -10 }}
              className="p-12 bg-brand-dark rounded-3xl border border-white/5 space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black">
                <Star size={32} />
              </div>
              <h3 className="text-3xl font-black tracking-tight">OUR VISION</h3>
              <p className="text-white/60 leading-relaxed">
                To remain a trusted name for families, farmers, and local businesses by continuously expanding our product range and service quality while preserving the honesty and commitment that have defined us since 1970.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-red text-xs font-black uppercase tracking-[0.3em]">What We Stand For</span>
          <h2 className="text-4xl font-black tracking-tight">OUR CORE VALUES</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: 'Trusted Quality', desc: 'We focus on dependable products and services that offer value, durability, and customer satisfaction.' },
            { icon: Award, title: 'Community Service', desc: 'From clothing and footwear to cyber services and agriculture support, we help meet everyday local needs.' },
            { icon: Users, title: 'Customer Trust', desc: 'Our growth has been built on honest dealing, long-term relationships, and service people can rely on.' },
          ].map((value, i) => (
            <div key={i} className="p-10 bg-brand-gray rounded-3xl border border-white/5 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red mx-auto">
                <value.icon size={28} />
              </div>
              <h4 className="text-xl font-bold">{value.title}</h4>
              <p className="text-white/40 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
