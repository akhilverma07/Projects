import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl max-h-[90vh] bg-brand-dark rounded-3xl z-[101] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-brand-red text-white rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-brand-red text-[10px] font-black uppercase tracking-[0.3em]">{product.category}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">{product.name}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-white">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-white/30 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                </div>

                <p className="text-white/50 text-sm leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Size Selection */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl text-xs font-bold transition-all border ${
                          selectedSize === size
                            ? 'bg-white text-black border-white'
                            : 'bg-brand-gray border-white/10 text-white hover:border-brand-red'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-brand-red text-white h-14 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-brand-red/20"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (isWishlisted) removeFromWishlist(product.id);
                      else addToWishlist(product);
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${
                      isWishlisted ? 'bg-white text-black border-white' : 'bg-brand-gray border-white/10 text-white hover:border-brand-red'
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                  <div className="flex flex-col items-center text-center gap-2">
                    <Truck size={16} className="text-brand-red" />
                    <span className="text-[8px] font-bold uppercase text-white/40">Free Delivery</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <RefreshCw size={16} className="text-brand-red" />
                    <span className="text-[8px] font-bold uppercase text-white/40">30-Day Returns</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={16} className="text-brand-red" />
                    <span className="text-[8px] font-bold uppercase text-white/40">Legacy Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
