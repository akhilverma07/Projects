
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';

const CartSidebar: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, isCartOpen, setIsCartOpen } = useApp();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[110] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-tight">Shopping Bag <span className="text-[#e84393]">({cart.length})</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-lg font-medium">Your bag is empty</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-sm font-bold uppercase tracking-widest text-[#e84393] underline underline-offset-8"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 group">
                    <div className="w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-zinc-800 leading-tight">{item.name}</h3>
                          <p className="text-sm font-bold text-[#e84393]">${item.price}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">
                          {item.selectedSize} / {item.selectedColor}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1 px-3 hover:bg-[#e84393] hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-8 text-center font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1 px-3 hover:bg-[#e84393] hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                          className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-500 font-bold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-zinc-50 space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Subtotal</span>
                      <span className="text-2xl font-black text-zinc-900">${total.toFixed(2)}</span>
                   </div>
                   <p className="text-[10px] text-zinc-400 uppercase font-medium">
                     Shipping & taxes calculated at checkout
                   </p>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-5 bg-[#e84393] text-white text-center text-sm font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_30px_rgba(232,67,147,0.3)] hover:translate-y-[-2px] transition-all"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
