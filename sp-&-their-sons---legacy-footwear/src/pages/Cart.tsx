import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentMethod, PaymentStatus } from '../types';

const paymentOptions: { value: PaymentMethod; description: string; status: PaymentStatus }[] = [
  { value: 'UPI', description: 'Pay instantly with any UPI app.', status: 'Paid' },
  { value: 'Card', description: 'Pay securely with debit or credit card.', status: 'Paid' },
  { value: 'Cash on Delivery', description: 'Pay when your order arrives.', status: 'Cash on Delivery' },
];

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useShop();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const shipping = cartTotal > 150 ? 0 : 15;
  const total = cartTotal + shipping;
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    deliveryAddress: '',
    pincode: '',
    paymentMethod: 'UPI' as PaymentMethod,
    upiId: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    orderForSomeoneElse: false,
    recipientName: '',
    recipientPhone: '',
  });

  const updateCheckoutField = (field: keyof typeof checkoutForm, value: string | boolean) => {
    setCheckoutForm((current) => ({ ...current, [field]: value }));
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login first to place your order.');
      return;
    }

    setCheckoutForm((current) => ({
      ...current,
      customerName: user.name,
      customerEmail: user.email,
    }));
    setCheckoutMessage('');
    setShowCheckoutForm(true);
  };

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setCheckoutMessage('Please login first to place your order.');
      return;
    }

    if (
      !checkoutForm.customerName.trim() ||
      !checkoutForm.customerEmail.trim() ||
      !checkoutForm.customerPhone.trim() ||
      !checkoutForm.deliveryAddress.trim() ||
      !checkoutForm.pincode.trim()
    ) {
      setCheckoutMessage('Please fill all delivery details.');
      return;
    }

    const customerPhone = checkoutForm.customerPhone.trim();
    const pincode = checkoutForm.pincode.trim();
    if (!/^\d{10}$/.test(customerPhone)) {
      setCheckoutMessage('Customer phone number must be exactly 10 digits.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setCheckoutMessage('Pincode must be exactly 6 digits.');
      return;
    }

    if (
      checkoutForm.orderForSomeoneElse &&
      (!checkoutForm.recipientName.trim() || !checkoutForm.recipientPhone.trim())
    ) {
      setCheckoutMessage('Please add receiver name and phone number.');
      return;
    }

    if (
      checkoutForm.orderForSomeoneElse &&
      !/^\d{10}$/.test(checkoutForm.recipientPhone.trim())
    ) {
      setCheckoutMessage('Receiver phone number must be exactly 10 digits.');
      return;
    }

    if (checkoutForm.paymentMethod === 'UPI' && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(checkoutForm.upiId.trim())) {
      setCheckoutMessage('Please enter a valid UPI ID.');
      return;
    }

    if (checkoutForm.paymentMethod === 'Card') {
      const normalizedCardNumber = checkoutForm.cardNumber.replace(/\s+/g, '');

      if (!checkoutForm.cardName.trim()) {
        setCheckoutMessage('Please enter the card holder name.');
        return;
      }

      if (!/^\d{16}$/.test(normalizedCardNumber)) {
        setCheckoutMessage('Card number must be exactly 16 digits.');
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(checkoutForm.cardExpiry.trim())) {
        setCheckoutMessage('Card expiry must be in MM/YY format.');
        return;
      }

      if (!/^\d{3}$/.test(checkoutForm.cardCvv.trim())) {
        setCheckoutMessage('CVV must be exactly 3 digits.');
        return;
      }
    }

    const selectedPayment = paymentOptions.find((option) => option.value === checkoutForm.paymentMethod) ?? paymentOptions[0];

    createOrder({
      userId: user.uid,
      customerName: checkoutForm.customerName.trim(),
      customerEmail: checkoutForm.customerEmail.trim(),
      customerPhone,
      deliveryAddress: checkoutForm.deliveryAddress.trim(),
      pincode,
      paymentMethod: selectedPayment.value,
      paymentStatus: selectedPayment.status,
      orderForSomeoneElse: checkoutForm.orderForSomeoneElse,
      recipientName: checkoutForm.orderForSomeoneElse ? checkoutForm.recipientName.trim() : '',
      recipientPhone: checkoutForm.orderForSomeoneElse ? checkoutForm.recipientPhone.trim() : '',
      items: cart,
      subtotal: cartTotal,
      shipping,
      total,
    });
    clearCart();
    setShowCheckoutForm(false);
    setCheckoutMessage('');
    setCheckoutForm({
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: '',
      deliveryAddress: '',
      pincode: '',
      paymentMethod: 'UPI' as PaymentMethod,
      upiId: '',
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      orderForSomeoneElse: false,
      recipientName: '',
      recipientPhone: '',
    });
    alert(`Order placed successfully with ${selectedPayment.value}.`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-4">
        <div className="w-24 h-24 bg-brand-gray rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-white/20" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tighter">YOUR CART IS EMPTY</h2>
          <p className="text-white/50 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart yet. Start exploring our legacy collection.
          </p>
        </div>
        <Link
          to="/products"
          className="bg-brand-red text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-brand-gray py-16 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black tracking-tighter">SHOPPING CART</h1>
          <p className="text-white/50 mt-2">You have {cart.length} items in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-brand-gray rounded-3xl border border-white/5 group"
                >
                  <div className="w-full sm:w-40 aspect-square rounded-2xl overflow-hidden shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-brand-red text-[10px] font-black uppercase tracking-widest mb-1">{item.category}</p>
                        <Link to={`/product/${item.id}`} className="text-xl font-bold hover:text-brand-red transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-white/40 text-sm mt-1">Size: {item.selectedSize} • {item.gender}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="p-2 text-white/30 hover:text-brand-red transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-6">
                      <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, -1)}
                          className="w-10 h-10 flex items-center justify-center hover:text-brand-red transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, 1)}
                          className="w-10 h-10 flex items-center justify-center hover:text-brand-red transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-white/30">₹{item.price} each</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="space-y-8">
            <div className="bg-brand-gray p-8 rounded-3xl border border-white/5 space-y-6 sticky top-32">
              <h3 className="text-xl font-black tracking-tight border-b border-white/5 pb-4">ORDER SUMMARY</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className="text-white font-bold">
                    {shipping === 0 ? <span className="text-green-500">FREE</span> : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-brand-red font-bold uppercase">
                    Add ₹{(150 - cartTotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-black text-brand-red">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-white text-black h-16 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all"
              >
                Checkout
                <ArrowRight size={20} />
              </button>

              {showCheckoutForm && (
                <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={handlePlaceOrder}>
                  <p className="text-sm font-black tracking-widest uppercase text-brand-red">Delivery Details</p>
                  <input
                    value={checkoutForm.customerName}
                    onChange={(e) => updateCheckoutField('customerName', e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                  />
                  <input
                    value={checkoutForm.customerEmail}
                    onChange={(e) => updateCheckoutField('customerEmail', e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                  />
                  <input
                    value={checkoutForm.customerPhone}
                    onChange={(e) => updateCheckoutField('customerPhone', e.target.value)}
                    placeholder="Phone number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                  />
                  <textarea
                    value={checkoutForm.deliveryAddress}
                    onChange={(e) => updateCheckoutField('deliveryAddress', e.target.value)}
                    placeholder="Delivery location / address"
                    rows={3}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red resize-none"
                  />
                  <input
                    value={checkoutForm.pincode}
                    onChange={(e) => updateCheckoutField('pincode', e.target.value)}
                    placeholder="Pincode"
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                  />
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-brand-dark/60 p-4">
                    <p className="text-sm font-black tracking-widest uppercase text-brand-red">Payment Method</p>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`rounded-2xl border px-4 py-3 transition-colors cursor-pointer ${
                            checkoutForm.paymentMethod === option.value
                              ? 'border-brand-red bg-brand-red/10'
                              : 'border-white/10 bg-black/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={checkoutForm.paymentMethod === option.value}
                              onChange={() => updateCheckoutField('paymentMethod', option.value)}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{option.value}</p>
                              <p className="text-xs text-white/50 mt-1">{option.description}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {checkoutForm.paymentMethod === 'UPI' && (
                      <input
                        value={checkoutForm.upiId}
                        onChange={(e) => updateCheckoutField('upiId', e.target.value)}
                        placeholder="UPI ID (example@upi)"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                      />
                    )}

                    {checkoutForm.paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <input
                          value={checkoutForm.cardName}
                          onChange={(e) => updateCheckoutField('cardName', e.target.value)}
                          placeholder="Card holder name"
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                        />
                        <input
                          value={checkoutForm.cardNumber}
                          onChange={(e) => updateCheckoutField('cardNumber', e.target.value.replace(/[^\d\s]/g, ''))}
                          placeholder="Card number"
                          inputMode="numeric"
                          maxLength={19}
                          className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={checkoutForm.cardExpiry}
                            onChange={(e) => updateCheckoutField('cardExpiry', e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                          />
                          <input
                            value={checkoutForm.cardCvv}
                            onChange={(e) => updateCheckoutField('cardCvv', e.target.value.replace(/\D/g, ''))}
                            placeholder="CVV"
                            inputMode="numeric"
                            maxLength={3}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                          />
                        </div>
                      </div>
                    )}

                    {checkoutForm.paymentMethod === 'Cash on Delivery' && (
                      <p className="text-xs text-white/50">
                        Your order will be placed now and the payment status will stay as cash on delivery until the order is fulfilled.
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={checkoutForm.orderForSomeoneElse}
                      onChange={(e) => updateCheckoutField('orderForSomeoneElse', e.target.checked)}
                    />
                    Order for someone else
                  </label>
                  {checkoutForm.orderForSomeoneElse && (
                    <>
                      <input
                        value={checkoutForm.recipientName}
                        onChange={(e) => updateCheckoutField('recipientName', e.target.value)}
                        placeholder="Receiver name"
                        className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                      />
                      <input
                        value={checkoutForm.recipientPhone}
                        onChange={(e) => updateCheckoutField('recipientPhone', e.target.value)}
                        placeholder="Receiver phone number"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:border-brand-red"
                      />
                    </>
                  )}
                  {checkoutMessage && <p className="text-sm text-brand-red">{checkoutMessage}</p>}
                  <button
                    type="submit"
                    className="w-full bg-brand-red text-white h-14 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
                  >
                    {checkoutForm.paymentMethod === 'Cash on Delivery' ? 'Place COD Order' : 'Pay & Place Order'}
                  </button>
                </form>
              )}

              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <ShieldCheck size={16} className="text-brand-red" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex justify-center gap-4 opacity-30 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
