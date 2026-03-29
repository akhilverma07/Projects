import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { motion } from 'motion/react';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const [showQuickView, setShowQuickView] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.sizes[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-brand-gray rounded-2xl overflow-hidden border border-white/5 hover:border-brand-red/30 transition-all duration-500"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.discount > 0 && (
          <span className="bg-brand-red text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
            {product.discount}% OFF
          </span>
        )}
        {product.isTrending && (
          <span className="bg-white text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
            Trending
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
          isWishlisted ? 'bg-brand-red text-white' : 'bg-black/20 text-white hover:bg-brand-red'
        }`}
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Quick View Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowQuickView(true);
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-500 hover:bg-brand-red border border-white/10"
        >
          <Eye size={14} />
          Quick View
        </button>

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 group-hover:translate-y-0 bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-500 hover:bg-brand-red hover:text-white"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </Link>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />

      {/* Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">{product.category}</p>
          <div className="flex items-center gap-1 text-brand-red">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold text-white/70">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-white group-hover:text-brand-red transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-white">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-white/30 line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
