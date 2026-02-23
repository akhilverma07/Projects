
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div 
          style={{ transform: "translateZ(50px)" }}
          className="relative aspect-[3/4] overflow-hidden bg-zinc-100 shadow-xl transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-black/20"
        >
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {product.isTrending && (
            <span 
              style={{ transform: "translateZ(30px)" }}
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] uppercase tracking-widest font-bold shadow-lg"
            >
              Trending
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        
        <div 
          style={{ transform: "translateZ(20px)" }}
          className="mt-6 flex flex-col items-center"
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">{product.category}</p>
          <h3 className="text-sm font-medium text-center group-hover:text-zinc-500 transition-colors">{product.name}</h3>
          <p className="mt-2 text-sm text-zinc-600 font-light">${product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
