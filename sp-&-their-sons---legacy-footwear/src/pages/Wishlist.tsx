import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-4">
        <div className="w-24 h-24 bg-brand-gray rounded-full flex items-center justify-center">
          <Heart size={40} className="text-white/20" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter">WISHLIST IS EMPTY</h2>
          <p className="text-white/50 max-w-xs mx-auto">
            Save your favorite items for later. Start exploring our legacy collection.
          </p>
        </div>
        <Link
          to="/products"
          className="bg-brand-red text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-brand-gray py-16 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black tracking-tighter">YOUR WISHLIST</h1>
          <p className="text-white/50 mt-2">You have {wishlist.length} items saved</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {wishlist.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-brand-gray rounded-2xl overflow-hidden border border-white/5 hover:border-brand-red/30 transition-all duration-500"
              >
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-brand-red transition-all"
                >
                  <Trash2 size={18} />
                </button>

                <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                </Link>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">{product.category}</p>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-red transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-black text-white mt-1">₹{product.price}</p>
                  </div>

                  <button
                    onClick={() => addToCart(product, product.sizes[0])}
                    className="w-full bg-white text-black py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-red hover:text-white transition-all"
                  >
                    <ShoppingCart size={14} />
                    Move to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
