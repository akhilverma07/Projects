
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Heart, Shield, RefreshCcw, Truck } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import { useApp } from '../App';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  useEffect(() => {
    if (id) {
      mockApi.getProductById(id).then(p => {
        setProduct(p);
        if (p) {
          setSelectedSize(p.sizes[0]);
          setSelectedColor(p.colors[0]);
        }
      });
    }
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const activeWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
            <motion.img 
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImg]} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => setActiveImg(prev => (prev > 0 ? prev - 1 : product.images.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveImg(prev => (prev < product.images.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`aspect-[3/4] border-2 transition-colors ${activeImg === idx ? 'border-zinc-900' : 'border-transparent'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">{product.category}</p>
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-full border transition-all ${
                activeWishlist ? 'bg-[#e84393] border-[#e84393] text-white shadow-lg' : 'border-zinc-200 text-zinc-400 hover:border-zinc-900'
              }`}
            >
              <Heart className={`w-5 h-5 ${activeWishlist ? 'fill-white' : ''}`} />
            </button>
          </div>
          <p className="text-2xl font-light mb-8">${product.price}</p>
          
          <p className="text-zinc-500 leading-relaxed mb-10">{product.description}</p>

          <div className="space-y-8 mb-10">
            {/* Colors */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest mb-4">Color: {selectedColor}</p>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center p-0.5 transition-all ${selectedColor === color ? 'border-zinc-900' : 'border-zinc-200'}`}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color === 'Pure White' ? '#fff' : color === 'Onyx Black' ? '#111' : '#ccc' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest">Select Size</p>
                <button className="text-[10px] uppercase underline tracking-widest text-zinc-400">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs border transition-all ${selectedSize === size ? 'bg-zinc-900 text-white border-zinc-900' : 'hover:border-zinc-900'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => addToCart(product, selectedSize, selectedColor)}
              className="flex-grow py-5 bg-zinc-900 text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
            >
              Add to Bag
            </button>
          </div>

          <div className="mt-12 space-y-6 pt-12 border-t">
            <div className="flex items-start gap-4">
              <Truck className="w-5 h-5 text-zinc-400 mt-1" />
              <div>
                <p className="text-sm font-medium">Complimentary Shipping</p>
                <p className="text-xs text-zinc-500">Free standard shipping on all orders over $250.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <RefreshCcw className="w-5 h-5 text-zinc-400 mt-1" />
              <div>
                <p className="text-sm font-medium">Extended 30-Day Returns</p>
                <p className="text-xs text-zinc-500">Worry-free returns for your peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-zinc-400 mt-1" />
              <div>
                <p className="text-sm font-medium">Authenticity Guaranteed</p>
                <p className="text-xs text-zinc-500">Every item is verified by our floral specialists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
