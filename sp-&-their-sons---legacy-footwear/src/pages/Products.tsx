import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, ArrowRight, ShieldCheck, Clock, Mail, Phone, Laptop2, FileCheck2, Landmark, CreditCard, Shirt, PackageCheck, Warehouse, IdCard, BadgeCheck, UserRoundCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ProductType, Gender, MainCategory } from '../types';
import { useProducts } from '../context/ProductContext';
import { clothingCategories, footwearCategories } from '../data/products';

type ProductSection = MainCategory | 'CSC Services' | 'Wholesale' | 'Aadhaar Center';

const Products = () => {
  const { products } = useProducts();
  const [activeMainCategory, setActiveMainCategory] = useState<ProductSection | null>(null);
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<ProductType | 'All'>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<'All' | 'Under500' | '500to1000' | '1000to2000' | '2000plus'>('All');
  const [selectedTag, setSelectedTag] = useState<'All' | 'Discount' | 'Trending' | 'Featured'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    if (!activeMainCategory) return [];
    if (activeMainCategory === 'CSC Services' || activeMainCategory === 'Wholesale' || activeMainCategory === 'Aadhaar Center') return [];
    const base = activeMainCategory === 'Footwear' ? footwearCategories : clothingCategories;
    return ['All', ...base] as (ProductType | 'All')[];
  }, [activeMainCategory]);

  const genders: (Gender | 'All')[] = ['All', 'Men', 'Women', 'Kids'];
  const priceRanges: ('All' | 'Under500' | '500to1000' | '1000to2000' | '2000plus')[] = ['All', 'Under500', '500to1000', '1000to2000', '2000plus'];
  const productTags: ('All' | 'Discount' | 'Trending' | 'Featured')[] = ['All', 'Discount', 'Trending', 'Featured'];
  const getPriceRangeLabel = (range: 'All' | 'Under500' | '500to1000' | '1000to2000' | '2000plus') => {
    switch (range) {
      case 'Under500':
        return 'Under 500';
      case '500to1000':
        return '500 to 1000';
      case '1000to2000':
        return '1000 to 2000';
      case '2000plus':
        return '2000+';
      default:
        return 'All Prices';
    }
  };

  const filteredProducts = useMemo(() => {
    if (activeMainCategory === 'CSC Services' || activeMainCategory === 'Wholesale' || activeMainCategory === 'Aadhaar Center') return [];
    let result = products.filter(p => {
      const matchesMain = !activeMainCategory || p.mainCategory === activeMainCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesGender = selectedGender === 'All' || p.gender === selectedGender;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice =
        selectedPriceRange === 'All' ||
        (selectedPriceRange === 'Under500' && p.price < 500) ||
        (selectedPriceRange === '500to1000' && p.price >= 500 && p.price <= 1000) ||
        (selectedPriceRange === '1000to2000' && p.price > 1000 && p.price <= 2000) ||
        (selectedPriceRange === '2000plus' && p.price > 2000);
      const matchesTag =
        selectedTag === 'All' ||
        (selectedTag === 'Discount' && p.discount > 0) ||
        (selectedTag === 'Trending' && Boolean(p.isTrending)) ||
        (selectedTag === 'Featured' && Boolean(p.isFeatured));
      return matchesMain && matchesSearch && matchesGender && matchesCategory && matchesPrice && matchesTag;
    });

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }

    return result;
  }, [activeMainCategory, search, selectedGender, selectedCategory, selectedPriceRange, selectedTag, sortBy, products]);

  if (!activeMainCategory) {
    return (
      <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">Choose Your Style</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">WHAT ARE YOU <br/> LOOKING FOR?</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[
            {
              id: 'Footwear',
              title: 'FOOTWEAR',
              desc: 'Step into legacy with our premium shoe collection.',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
            },
            {
              id: 'Clothing',
              title: 'CLOTHING',
              desc: 'Modern innovation meets traditional craftsmanship.',
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80'
            },
            {
              id: 'CSC Services',
              title: 'CSC SERVICES',
              desc: 'Aadhaar, PAN, LIC, passport, banking, and government service support.',
              image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80'
            },
            {
              id: 'Wholesale',
              title: 'WHOLESALE',
              desc: 'Bulk clothing supply for shops, resellers, and high-volume buyers.',
              image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80'
            },
            {
              id: 'Aadhaar Center',
              title: 'AADHAAR CENTER',
              desc: 'New Aadhaar related work, mobile updates, photo updates, and document guidance.',
              image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80'
            }
          ].map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ y: -10 }}
              onClick={() => setActiveMainCategory(cat.id as ProductSection)}
              className="relative h-[500px] rounded-3xl overflow-hidden group text-left"
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-12">
                <h2 className="text-5xl font-black tracking-tighter mb-4">{cat.title}</h2>
                <p className="text-white/60 mb-8 max-w-xs">{cat.desc}</p>
                <div className="flex items-center gap-2 text-brand-red font-black uppercase tracking-widest text-sm">
                  Explore Now <ArrowRight size={20} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (activeMainCategory === 'CSC Services') {
    const cscServices = [
      { icon: FileCheck2, title: 'Aadhaar & PAN Services', desc: 'Registration, updates, corrections, PAN card support, and linked documentation help.' },
      { icon: Landmark, title: 'Government & Farmer Schemes', desc: 'Support for PM Kisan Nidhi, PM Shram Yojana, and other public service applications.' },
      { icon: CreditCard, title: 'LIC, Passport & Banking Work', desc: 'LIC-related help, passport services, HDFC Bank assistance, and other banking-related support.' },
      { icon: Laptop2, title: 'CSC Digital Center Support', desc: 'Cyber Cafe based online form filling, print support, document handling, and service guidance.' },
    ];

    return (
      <div className="min-h-screen pb-24">
        <div className="bg-brand-gray py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <button
                  onClick={() => setActiveMainCategory(null)}
                  className="text-brand-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                >
                  <X size={14} /> Back to Selection
                </button>
                <h1 className="text-5xl font-black tracking-tighter uppercase">CSC SERVICE CENTER</h1>
                <p className="text-white/50 max-w-3xl">
                  Explore the essential CSC and Cyber Cafe services available at SP & Their Sons, including document services, banking support, public schemes, and government-related assistance.
                </p>
              </div>

              <div className="inline-flex self-start rounded-full border border-brand-red/20 bg-brand-red/10 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
                Dedicated Support Desk
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cscServices.map((service) => (
              <motion.div
                key={service.title}
                whileHover={{ y: -6 }}
                className="rounded-[2rem] border border-white/5 bg-brand-gray p-8 space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-red/10 text-brand-red">
                  <service.icon size={30} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8">
            <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-brand-gray to-brand-dark p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Available Assistance</p>
                <h2 className="text-3xl font-black tracking-tight">All Essential CSC Center Work In One Place</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/65">
                {[
                  'Aadhaar card registration and updates',
                  'PAN card services',
                  'LIC services',
                  'Passport-related services',
                  'Online government application support',
                  'PM Kisan Nidhi and PM Shram Yojana assistance',
                  'HDFC Bank and other bank-related work',
                  'Document upload, print, and digital form support',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-brand-gray p-10 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Contact Details</p>
                <h2 className="text-3xl font-black tracking-tight">CSC Service Contact</h2>
              </div>

              <div className="rounded-3xl border border-white/5 bg-brand-dark/70 p-6 space-y-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Contact Person</p>
                  <h3 className="mt-2 text-2xl font-black">Mr. Rameshwari Prasad Verma</h3>
                </div>
                <a
                  href="tel:9984270109"
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Mobile</span>
                    <span className="text-base font-semibold">9984270109</span>
                  </span>
                </a>
                <a
                  href="mailto:rpverma0786@gmail.com"
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Mail size={18} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Email</span>
                    <span className="text-base font-semibold break-all">rpverma0786@gmail.com</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeMainCategory === 'Wholesale') {
    const wholesaleHighlights = [
      { icon: Shirt, title: 'All Types Of Clothing', desc: 'Traditional wear, daily wear, seasonal collections, and readymade garments for men, women, and children.' },
      { icon: PackageCheck, title: 'Bulk Order Support', desc: 'Reliable supply support for retailers, resellers, institutions, and high-volume customers looking for value.' },
      { icon: Warehouse, title: 'Wholesale & Retail Experience', desc: 'Years of trusted market experience with strong product variety, practical pricing, and customer-first service.' },
      { icon: ShieldCheck, title: 'Trusted Quality & Value', desc: 'Focused on quality clothing at the best value for individual customers as well as business buyers.' },
    ];

    return (
      <div className="min-h-screen pb-24">
        <div className="bg-brand-gray py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <button
                  onClick={() => setActiveMainCategory(null)}
                  className="text-brand-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                >
                  <X size={14} /> Back to Selection
                </button>
                <h1 className="text-5xl font-black tracking-tighter uppercase">WHOLESALE CLOTHING</h1>
                <p className="text-white/50 max-w-3xl">
                  Explore our wholesale clothing offering for resellers, local shops, and bulk buyers. We provide dependable supply support, variety, and strong value across multiple clothing categories.
                </p>
              </div>

              <div className="inline-flex self-start rounded-full border border-brand-red/20 bg-brand-red/10 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
                Wholesale Partner Support
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wholesaleHighlights.map((service) => (
              <motion.div
                key={service.title}
                whileHover={{ y: -6 }}
                className="rounded-[2rem] border border-white/5 bg-brand-gray p-8 space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-red/10 text-brand-red">
                  <service.icon size={30} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8">
            <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-brand-gray to-brand-dark p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Wholesale Range</p>
                <h2 className="text-3xl font-black tracking-tight">Built For Retailers, Bulk Buyers, And Growing Businesses</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/65">
                {[
                  'Traditional wear collections',
                  'Daily wear and seasonal clothing',
                  'Readymade garments for men',
                  'Readymade garments for women',
                  'Readymade garments for children',
                  'Value-focused bulk order supply',
                  'Wholesale and retail buying support',
                  'Reliable stock guidance for repeat buyers',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-brand-gray p-10 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Contact Details</p>
                <h2 className="text-3xl font-black tracking-tight">Wholesale Contact</h2>
              </div>

              <div className="rounded-3xl border border-white/5 bg-brand-dark/70 p-6 space-y-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Contact Person</p>
                  <h3 className="mt-2 text-2xl font-black">Mr. Vindeshwari Prasad Verma</h3>
                </div>
                <a
                  href="tel:9838518542"
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Mobile</span>
                    <span className="text-base font-semibold">9838518542</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeMainCategory === 'Aadhaar Center') {
    const aadhaarServices = [
      { icon: IdCard, title: 'New Aadhaar Card Registration', desc: 'We have introduced a New Aadhaar Center for all Aadhaar-related services and registration support.' },
      { icon: BadgeCheck, title: 'Aadhaar Update Services', desc: 'Mobile number update, Aadhaar photo update, and address change or correction support are available.' },
      { icon: UserRoundCheck, title: 'Required Documents', desc: 'Document guidance is available for children below 5 years and for individuals above 5 years.' },
      { icon: ShieldCheck, title: 'Address Change Support', desc: 'For address change, valid address proof certificate is required. Contact us for more details and assistance.' },
    ];

    return (
      <div className="min-h-screen pb-24">
        <div className="bg-brand-gray py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <button
                  onClick={() => setActiveMainCategory(null)}
                  className="text-brand-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                >
                  <X size={14} /> Back to Selection
                </button>
                <h1 className="text-5xl font-black tracking-tighter uppercase">NEW AADHAAR CENTER</h1>
                <p className="text-white/50 max-w-3xl">
                  We have introduced a New Aadhaar Center for all Aadhaar-related services, including registration, updates, and document guidance.
                </p>
              </div>

              <div className="inline-flex self-start rounded-full border border-brand-red/20 bg-brand-red/10 px-6 py-3 text-xs font-black uppercase tracking-[0.28em] text-brand-red">
                Aadhaar Help Desk
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aadhaarServices.map((service) => (
              <motion.div
                key={service.title}
                whileHover={{ y: -6 }}
                className="rounded-[2rem] border border-white/5 bg-brand-gray p-8 space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-red/10 text-brand-red">
                  <service.icon size={30} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">{service.title}</h3>
                  <p className="text-white/60 leading-relaxed">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8">
            <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-brand-gray to-brand-dark p-10 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Required Details</p>
                <h2 className="text-3xl font-black tracking-tight">Services And Required Documents</h2>
              </div>
              <div className="space-y-4 text-sm text-white/65">
                <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                  Services available: New Aadhaar Card registration, mobile number update in Aadhaar, photo update in Aadhaar, and address change or update in Aadhaar.
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                  For children below 5 years: Birth Certificate and Parent&apos;s Aadhaar Card.
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                  For individuals above 5 years: Birth Certificate or High School Marksheet.
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 px-5 py-4">
                  For address change, valid address proof certificate is required. For more details and assistance, please contact us.
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-brand-gray p-10 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">Contact Details</p>
                <h2 className="text-3xl font-black tracking-tight">Aadhaar Center Contact</h2>
              </div>

              <div className="rounded-3xl border border-white/5 bg-brand-dark/70 p-6 space-y-5">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Contact Person</p>
                  <h3 className="mt-2 text-2xl font-black">Mr. Aman Verma</h3>
                </div>
                <a
                  href="tel:7408091760"
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white/70 transition-all hover:border-brand-red/30 hover:text-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                    <Phone size={18} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-[0.3em] text-white/35">Mobile</span>
                    <span className="text-base font-semibold">7408091760</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-brand-gray py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <button 
                onClick={() => setActiveMainCategory(null)}
                className="text-brand-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
              >
                <X size={14} /> Back to Selection
              </button>
              <h1 className="text-5xl font-black tracking-tighter uppercase">{activeMainCategory} COLLECTION</h1>
              <p className="text-white/50 max-w-2xl">
                Discover our extensive range of premium {activeMainCategory.toLowerCase()}, meticulously crafted for every occasion.
              </p>
            </div>
            
            {/* Quick Switch Tabs */}
            <div className="flex bg-black/40 p-1 rounded-full border border-white/10 self-start">
              {(['Footwear', 'Clothing'] as MainCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveMainCategory(cat);
                    setSelectedCategory('All');
                  }}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    activeMainCategory === cat ? 'bg-brand-red text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-12">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input
              type="text"
              placeholder={`Search in ${activeMainCategory.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-gray border border-white/10 rounded-full py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-red transition-all"
            />
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-4 bg-brand-gray border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all lg:hidden"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
            <div className="relative flex-1 lg:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full lg:w-48 bg-brand-gray border border-white/10 rounded-full py-4 px-6 text-sm font-bold uppercase tracking-widest appearance-none focus:outline-none focus:border-brand-red cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Gender</h3>
              <div className="space-y-3">
                {genders.map(gender => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`block w-full text-left text-sm font-bold uppercase tracking-widest transition-all ${
                      selectedGender === gender ? 'text-brand-red' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Type</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left text-sm font-bold uppercase tracking-widest transition-all ${
                      selectedCategory === cat ? 'text-brand-red' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Price</h3>
              <div className="space-y-3">
                {priceRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => setSelectedPriceRange(range)}
                    className={`block w-full text-left text-sm font-bold uppercase tracking-widest transition-all ${
                      selectedPriceRange === range ? 'text-brand-red' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {getPriceRangeLabel(range)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Tag</h3>
              <div className="space-y-3">
                {productTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`block w-full text-left text-sm font-bold uppercase tracking-widest transition-all ${
                      selectedTag === tag ? 'text-brand-red' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {tag === 'All' ? 'All Products' : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-white/5">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-brand-red/10 p-12 rounded-[2.5rem] border border-brand-red/20 space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-lg"
                >
                  Limited Offer
                </motion.div>

                <h4 className="text-2xl font-black leading-[1.2] tracking-tight">
                  SEASONAL <br/>
                  <span className="text-brand-red">50% OFF</span>
                </h4>

                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: 'Verified Quality' },
                    { icon: Clock, text: 'Ends Soon' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/60">
                      <item.icon size={14} className="text-brand-red" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{item.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-white/70 font-medium leading-relaxed">
                  Premium items from our legacy collection now at half price.
                </p>
                
                <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-red group/link">
                  <span className="border-b-2 border-brand-red pb-1 group-hover/link:text-white group-hover/link:border-white transition-all">Shop Collection</span>
                  <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-white/40 font-medium">
                Showing <span className="text-white">{filteredProducts.length}</span> products
              </p>
              {(selectedGender !== 'All' || selectedCategory !== 'All' || selectedPriceRange !== 'All' || selectedTag !== 'All' || search) && (
                <button
                  onClick={() => {
                    setSelectedGender('All');
                    setSelectedCategory('All');
                    setSelectedPriceRange('All');
                    setSelectedTag('All');
                    setSearch('');
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-brand-red hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-brand-gray rounded-3xl border border-dashed border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No products found</h3>
                <p className="text-white/40">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-full max-w-xs bg-brand-dark z-[70] p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black tracking-tighter">FILTERS</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:text-brand-red">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-12">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Gender</h3>
                  <div className="flex flex-wrap gap-3">
                    {genders.map(gender => (
                      <button
                        key={gender}
                        onClick={() => setSelectedGender(gender)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                          selectedGender === gender
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Type</h3>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                          selectedCategory === cat
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Price</h3>
                  <div className="flex flex-wrap gap-3">
                    {priceRanges.map(range => (
                      <button
                        key={range}
                        onClick={() => setSelectedPriceRange(range)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                          selectedPriceRange === range
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {getPriceRangeLabel(range)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-red mb-6">Tag</h3>
                  <div className="flex flex-wrap gap-3">
                    {productTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                          selectedTag === tag
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {tag === 'All' ? 'All Products' : tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-16 bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all"
              >
                Show Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
