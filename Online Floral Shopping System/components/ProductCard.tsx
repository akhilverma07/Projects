
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../App';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useApp();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const activeWishlist = isInWishlist(product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer"
    >
      <div className="block">
        <div 
          style={{ transform: "translateZ(50px)" }}
          className="relative aspect-square overflow-hidden bg-zinc-100 rounded-2xl shadow-xl transition-shadow duration-500 group-hover:shadow-[#e84393]/20"
        >
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`absolute top-4 right-4 p-2 rounded-full shadow-lg z-10 transition-all ${
              activeWishlist ? 'bg-[#e84393] text-white' : 'bg-white text-zinc-400 hover:text-[#e84393]'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeWishlist ? 'fill-white' : ''}`} />
          </button>

          {product.isTrending && (
            <span 
              style={{ transform: "translateZ(30px)" }}
              className="absolute top-4 left-4 bg-[#e84393] text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold shadow-lg rounded-full"
            >
              Trending
            </span>
          )}
          
          <Link to={`/product/${product.id}`} className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
             <span className="bg-white text-zinc-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
               Quick View
             </span>
          </Link>
        </div>
        
        <div 
          style={{ transform: "translateZ(20px)" }}
          className="mt-6 flex flex-col items-center"
        >
          <p className="text-[10px] uppercase tracking-widest text-[#e84393] font-bold mb-1">{product.category}</p>
          <h3 className="text-lg font-bold text-center text-zinc-800 group-hover:text-[#e84393] transition-colors">{product.name}</h3>
          <div className="flex items-center gap-3 mt-2">
             <p className="text-xl font-black text-zinc-900">${product.price}</p>
             <p className="text-sm text-zinc-400 line-through">${(product.price * 1.2).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
