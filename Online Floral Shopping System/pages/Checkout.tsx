
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, ChevronLeft } from 'lucide-react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';

const Checkout: React.FC = () => {
  const { cart, clearCart } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock Stripe delay
    setTimeout(async () => {
      try {
        await mockApi.createOrder(cart, total);
        clearCart();
        alert('Payment successful! Your order has been placed.');
        navigate('/');
      } catch (err) {
        alert('Please login to place an order.');
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (cart.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-serif mb-6">Your bag is empty</h2>
      <Link to="/shop" className="text-xs font-bold uppercase tracking-widest underline underline-offset-4">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left: Forms */}
        <div className="space-y-12">
          <div>
            <Link to="/shop" className="inline-flex items-center text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 mb-12">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Store
            </Link>
            <h1 className="text-4xl font-serif mb-8">Secure Checkout</h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-10">
            <section>
              <h3 className="text-[10px] uppercase font-bold tracking-widest mb-6 border-b pb-2">Shipping Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="First Name" required className="col-span-1 px-5 py-4 bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                <input placeholder="Last Name" required className="col-span-1 px-5 py-4 bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                <input placeholder="Address Line 1" required className="col-span-2 px-5 py-4 bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                <input placeholder="City" required className="col-span-1 px-5 py-4 bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                <input placeholder="Postal Code" required className="col-span-1 px-5 py-4 bg-zinc-50 border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
              </div>
            </section>

            <section>
              <h3 className="text-[10px] uppercase font-bold tracking-widest mb-6 border-b pb-2">Payment Details</h3>
              <div className="p-6 bg-zinc-50 border border-zinc-100 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs uppercase font-bold tracking-widest">Card Payment</span>
                </div>
                <input placeholder="Card Number" required className="w-full px-5 py-4 bg-white border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="MM/YY" required className="px-5 py-4 bg-white border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                  <input placeholder="CVC" required className="px-5 py-4 bg-white border border-zinc-100 outline-none focus:border-zinc-900 transition-colors" />
                </div>
              </div>
            </section>

            <button 
              disabled={isProcessing}
              className="w-full py-6 bg-zinc-900 text-white text-sm font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing Securely...' : `Pay $${total.toFixed(2)}`}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-zinc-400">
              <ShieldCheck className="w-4 h-4" />
              <span>AES-256 Bit Encrypted Secure Connection</span>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-zinc-50 p-10 h-fit sticky top-24">
          <h3 className="text-[10px] uppercase font-bold tracking-widest mb-10 border-b border-zinc-200 pb-2">Order Summary</h3>
          <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto">
            {cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                <img src={item.images[0]} className="w-16 h-20 object-cover" alt={item.name} />
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <span className="text-sm">${item.price * item.quantity}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Qty: {item.quantity} / Size: {item.selectedSize}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-10 border-t border-zinc-200">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-xl font-serif pt-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
