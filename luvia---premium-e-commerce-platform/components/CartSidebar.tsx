
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[110] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-serif">Shopping Bag ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your bag is empty</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900 underline underline-offset-4"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                    <div className="w-24 h-32 bg-zinc-100 flex-shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-sm font-medium">${item.price}</p>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tight">
                          Size: {item.selectedSize} / Color: {item.selectedColor}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-zinc-200">
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-zinc-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-zinc-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                          className="text-[10px] uppercase tracking-widest text-red-500 font-bold"
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
              <div className="p-6 border-t space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-xs uppercase tracking-widest">Subtotal</span>
                  <span className="text-xl font-medium">${total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-tight text-center">
                  Shipping & taxes calculated at checkout
                </p>
                <Link 
                  to="/checkout" 
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-4 bg-zinc-900 text-white text-center text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                  Checkout
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
