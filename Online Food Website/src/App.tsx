import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, LogOut, Menu as MenuIcon, X, Plus, Minus, Trash2, ChevronRight, Star, Clock, MapPin, Search, Package, CheckCircle, XCircle, Pencil, Eye } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { FoodItem, type User as AppUser } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db } from './lib/firebase';
import { resolveUserRole } from './lib/roles';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MENU_CATEGORIES = [
  'Burgers',
  'Pizza',
  'Japanese',
  'Indian',
  'South Indian',
  'Chinese',
  'Salads',
  'Pasta',
  'Breakfast',
  'Steak',
  'Seafood',
  'Vegan',
  'Beverages',
  'Desserts'
];

const MENU_FILTER_CATEGORIES = ['All', ...MENU_CATEGORIES];

const FALLBACK_MENU_ITEMS: FoodItem[] = [
  { id: 'butter-chicken', name: 'Butter Chicken', description: 'Tender chicken in creamy tomato-butter gravy.', price: 14.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },
  { id: 'chole-bhature', name: 'Chole Bhature', description: 'Spiced chickpea curry served with fluffy fried bhatura bread.', price: 12.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1626132647523-66d88d66ef95?auto=format&fit=crop&w=800&q=80' },
  { id: 'chicken-biryani', name: 'Chicken Biryani', description: 'Aromatic basmati rice with marinated chicken and spices.', price: 13.49, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80' },
  { id: 'paneer-butter-masala', name: 'Paneer Butter Masala', description: 'Soft paneer cubes in silky tomato-cashew gravy.', price: 13.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
  { id: 'masala-dosa', name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato masala.', price: 9.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80' },
  { id: 'idli-sambar', name: 'Idli Sambar', description: 'Steamed rice cakes served with sambar and chutneys.', price: 8.49, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80' },
  { id: 'medu-vada', name: 'Medu Vada', description: 'Crispy lentil donuts served with coconut chutney.', price: 8.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { id: 'uttapam', name: 'Uttapam', description: 'Thick savory pancake topped with onions, tomato, and chilies.', price: 9.49, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?auto=format&fit=crop&w=800&q=80' },
  { id: 'veg-hakka-noodles', name: 'Veg Hakka Noodles', description: 'Classic Indo-Chinese noodles stir-fried with crunchy veggies.', price: 10.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80' },
  { id: 'chilli-chicken', name: 'Chilli Chicken', description: 'Crispy chicken tossed in spicy Indo-Chinese gravy.', price: 12.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80' },
  { id: 'veg-manchurian', name: 'Veg Manchurian', description: 'Vegetable dumplings in tangy and spicy Manchurian sauce.', price: 11.49, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
  { id: 'schezwan-fried-rice', name: 'Schezwan Fried Rice', description: 'Popular spicy fried rice tossed with schezwan sauce.', price: 10.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' }
];

export default function App() {
  const { user, loading, logout } = useAuth();
  const { items, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'admin' | 'auth' | 'orders'>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ restaurantName: '', contactName: '', email: '', phone: '', cuisine: '' });
  const [partnerFormStatus, setPartnerFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryFor, setDeliveryFor] = useState<'self' | 'other'>('self');
  const [deliveryForm, setDeliveryForm] = useState({ recipientName: '', address: '', pincode: '', mobile: '' });
  const [deliveryError, setDeliveryError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Show fallback menu by default so UI is never empty if Firestore is unavailable.
    setMenuItems(FALLBACK_MENU_ITEMS);
    const unsubscribe = onSnapshot(
      collection(db, 'menu'),
      (querySnapshot) => {
        if (querySnapshot.empty) {
          setMenuItems(FALLBACK_MENU_ITEMS);
          return;
        }
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
        setMenuItems(items);
      },
      () => {
        setMenuItems(FALLBACK_MENU_ITEMS);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;
    if (previousUserId && !currentUserId) {
      clearCart();
    }
    previousUserIdRef.current = currentUserId;
  }, [user, clearCart]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        const normalizedEmail = authForm.email.trim().toLowerCase();
        const approvedPartnerQuery = query(
          collection(db, 'partner_applications'),
          where('email_lower', '==', normalizedEmail),
          where('status', '==', 'confirmed')
        );
        const approvedPartnerDocs = await getDocs(approvedPartnerQuery);
        const isApprovedPartner = !approvedPartnerDocs.empty;
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        // Create user doc in Firestore
        const userPayload: Record<string, string> = {
          name: authForm.name,
          email: authForm.email,
          email_lower: normalizedEmail,
          role: isApprovedPartner ? 'admin' : resolveUserRole(authForm.email)
        };
        if (isApprovedPartner) userPayload.admin_scope = 'own';
        await setDoc(doc(db, 'users', userCredential.user.uid), userPayload);
        await updateProfile(userCredential.user, { displayName: authForm.name });
      }
      setActiveTab('home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setActiveTab('auth');
      setIsCartOpen(false);
      return;
    }
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setDeliveryFor('self');
    setDeliveryError('');
    setDeliveryForm(prev => ({
      ...prev,
      recipientName: prev.recipientName || user.name
    }));
    setIsDeliveryModalOpen(true);
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const recipientName = deliveryForm.recipientName.trim();
    const address = deliveryForm.address.trim();
    const pincode = deliveryForm.pincode.trim();
    const mobile = deliveryForm.mobile.trim();

    if (!recipientName || !address || !pincode || !mobile) {
      setDeliveryError('Please fill all delivery details.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryError('Pincode must be 6 digits.');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(mobile.replace(/\s+/g, ''))) {
      setDeliveryError('Mobile number must be 10 to 15 digits.');
      return;
    }

    setDeliveryError('');
    setIsSubmittingOrder(true);
    try {
      const orderData = {
        user_id: user.id,
        user_name: user.name,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url
        })),
        total_price: totalPrice,
        status: 'pending',
        delivery_for: deliveryFor,
        delivery_details: {
          recipient_name: recipientName,
          address,
          pincode,
          mobile
        },
        created_at: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      alert('Order placed successfully!');
      clearCart();
      setDeliveryForm({ recipientName: '', address: '', pincode: '', mobile: '' });
      setIsDeliveryModalOpen(false);
      setIsCartOpen(false);
      setActiveTab('orders');
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(`Failed to place order: ${err.message || 'Unknown error'}. Please ensure Firestore rules allow writes.`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }
    setNewsletterMessage('Thanks for subscribing. Weekly offers will be sent to your email.');
    setNewsletterEmail('');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 
            className="text-2xl font-bold tracking-tighter cursor-pointer" 
            onClick={() => setActiveTab('home')}
          >
            BITE<span className="text-emerald-600">DASH</span>
          </h1>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setActiveTab('home')} className={cn("hover:text-emerald-600 transition-colors", activeTab === 'home' && "text-emerald-600")}>Home</button>
            <button onClick={() => setActiveTab('menu')} className={cn("hover:text-emerald-600 transition-colors", activeTab === 'menu' && "text-emerald-600")}>Menu</button>
            {user && (
              <button onClick={() => setActiveTab('orders')} className={cn("hover:text-emerald-600 transition-colors", activeTab === 'orders' && "text-emerald-600")}>My Orders</button>
            )}
            {user?.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={cn("hover:text-emerald-600 transition-colors", activeTab === 'admin' && "text-emerald-600")}>Admin Panel</button>
            )}
            <button onClick={() => setShowPartnerModal(true)} className="hover:text-emerald-600 transition-colors">Become a Partner</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none">{user.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Package size={10} /> My Orders
                </button>
              </div>
              <button 
                onClick={() => logout()}
                className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('auth')}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero Section */}
              <section className="relative h-[500px] rounded-3xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80" 
                  alt="Hero"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl font-bold tracking-tight mb-4"
                  >
                    Delicious Food,<br />Delivered Fast.
                  </motion.h2>
                  <p className="text-lg text-white/80 mb-8 max-w-md">
                    Experience the best local restaurants delivered straight to your door. Fresh, hot, and ready to eat.
                  </p>
                  <button 
                    onClick={() => setActiveTab('menu')}
                    className="w-fit px-8 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-500 transition-all flex items-center gap-2 group"
                  >
                    Order Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </section>

              {/* Featured Categories */}
              <section>
                <h3 className="text-2xl font-bold mb-8">Popular Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {MENU_CATEGORIES.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab('menu');
                      }}
                      className="p-6 bg-white border border-black/5 rounded-2xl hover:border-emerald-600/50 hover:shadow-xl hover:shadow-emerald-600/5 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                        <Star size={20} className="text-emerald-600" />
                      </div>
                      <span className="font-bold text-sm">{cat}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Popular Items */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Trending Now</h3>
                  <button onClick={() => setActiveTab('menu')} className="text-emerald-600 font-bold text-sm hover:underline">View all</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {menuItems.slice(0, 3).map((item) => (
                    <FoodCard key={item.id} item={item} onAdd={() => addToCart(item)} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight">Our Menu</h2>
                  <p className="text-gray-500">Explore our wide variety of delicious dishes.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {MENU_FILTER_CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap",
                        selectedCategory === cat ? "bg-emerald-600 border-emerald-600 text-white" : "border-black/5 bg-white hover:border-emerald-600"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {menuItems
                  .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                  .map((item) => (
                    <FoodCard key={item.id} item={item} onAdd={() => addToCart(item)} />
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'auth' && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl border border-black/5 shadow-xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Join BiteDash'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {authMode === 'login' ? 'Sign in to continue your food journey' : 'Create an account to start ordering'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-black/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                      placeholder="John Doe"
                      value={authForm.name}
                      onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                    placeholder="john@example.com"
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>
                
                {error && <p className="text-red-600 text-xs font-medium">{error}</p>}

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Admin Demo Access</p>
                  <p className="text-xs text-emerald-800">Email: <span className="font-bold">admin@bitedash.com</span></p>
                  <p className="text-xs text-emerald-800">Password: <span className="font-bold">any password</span> (first time creates it)</p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-black/80 transition-all mt-4"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-black/5 text-center">
                <p className="text-sm text-gray-500">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && user?.role === 'admin' && (
            <AdminPanel user={user} menuItems={menuItems} setMenuItems={setMenuItems} />
          )}

          {activeTab === 'orders' && user && (
            <OrdersView />
          )}
        </AnimatePresence>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Your Cart <span className="text-sm font-normal text-gray-400">({totalItems} items)</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShoppingCart size={32} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="font-bold">Your cart is empty</p>
                      <p className="text-sm text-gray-500">Add some delicious items to get started!</p>
                    </div>
                    <button 
                      onClick={() => { setIsCartOpen(false); setActiveTab('menu'); }}
                      className="px-6 py-2 bg-black text-white text-sm font-bold rounded-full"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-20 h-20 rounded-xl object-cover border border-black/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1 border border-black/5">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-emerald-600 transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-emerald-600 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t border-black/5 bg-gray-50/50 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Delivery Fee</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-black/5">
                      <span>Total</span>
                      <span>${(totalPrice + 2.99).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeliveryModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeliveryModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white p-8 rounded-3xl z-[90] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Delivery Details</h3>
                <button
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryFor('self');
                      setDeliveryForm(prev => ({ ...prev, recipientName: user?.name || prev.recipientName }));
                    }}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-bold transition-all",
                      deliveryFor === 'self' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-black/10 hover:border-emerald-300"
                    )}
                  >
                    For Myself
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryFor('other')}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-bold transition-all",
                      deliveryFor === 'other' ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-black/10 hover:border-emerald-300"
                    )}
                  >
                    For Someone Else
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Recipient Name</label>
                  <input
                    required
                    type="text"
                    value={deliveryForm.recipientName}
                    onChange={e => setDeliveryForm({ ...deliveryForm, recipientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-gray-50 focus:outline-none focus:border-emerald-600 transition-all"
                    placeholder={deliveryFor === 'self' ? 'Your name' : 'Receiver name'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Address</label>
                  <textarea
                    required
                    rows={3}
                    value={deliveryForm.address}
                    onChange={e => setDeliveryForm({ ...deliveryForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-gray-50 focus:outline-none focus:border-emerald-600 transition-all"
                    placeholder="Flat/House, Street, Area, City"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Pincode</label>
                    <input
                      required
                      type="text"
                      value={deliveryForm.pincode}
                      onChange={e => setDeliveryForm({ ...deliveryForm, pincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-gray-50 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="6-digit pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Mobile Number</label>
                    <input
                      required
                      type="tel"
                      value={deliveryForm.mobile}
                      onChange={e => setDeliveryForm({ ...deliveryForm, mobile: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-gray-50 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="10 to 15 digits"
                    />
                  </div>
                </div>

                {deliveryError && <p className="text-red-600 text-xs font-medium">{deliveryError}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeliveryModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all"
                  >
                    {isSubmittingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PartnerModal isOpen={showPartnerModal} onClose={() => setShowPartnerModal(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tighter">BITE<span className="text-emerald-600">DASH</span></h1>
            <p className="text-sm text-gray-500">The best food delivery service in town. Fresh, fast, and reliable.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-emerald-600 transition-colors">Home</button></li>
              <li><button onClick={() => setActiveTab('menu')} className="hover:text-emerald-600 transition-colors">Browse Menu</button></li>
              <li><button onClick={() => setShowPartnerModal(true)} className="hover:text-emerald-600 transition-colors">Become a Partner</button></li>
              <li><button onClick={() => setActiveTab('orders')} className="hover:text-emerald-600 transition-colors">Track My Orders</button></li>
              <li><a href="mailto:admin@bitedash.com" className="hover:text-emerald-600 transition-colors">Contact Admin</a></li>
              {user && (
                <li><button onClick={() => setActiveTab('orders')} className="hover:text-emerald-600 transition-colors">My Orders</button></li>
              )}
              {user?.role === 'admin' && (
                <li><button onClick={() => setActiveTab('admin')} className="hover:text-emerald-600 transition-colors">Admin Dashboard</button></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="text-gray-700 font-medium">Help Center (24x7)</li>
              <li><a href="tel:+919876543210" className="hover:text-emerald-600 transition-colors">Admin Phone: +91 98765 43210</a></li>
              <li><a href="mailto:admin@bitedash.com" className="hover:text-emerald-600 transition-colors">Admin Email: admin@bitedash.com</a></li>
              <li><button onClick={() => setLegalModal('terms')} className="hover:text-emerald-600 transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => setLegalModal('privacy')} className="hover:text-emerald-600 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-emerald-600 transition-colors">Delivery Areas (7 AM - 11 PM)</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Get weekly offers, new dishes, and festival discounts.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterMessage) setNewsletterMessage('');
                  }}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-full bg-gray-50 border border-black/5 text-sm focus:outline-none focus:border-emerald-600"
                />
                <button type="submit" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full">Join</button>
              </div>
              {newsletterMessage && <p className="text-xs text-gray-500">{newsletterMessage}</p>}
              <p className="text-[11px] text-gray-400">By joining, you agree to receive promotional emails from BiteDash.</p>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-black/5 text-center text-xs text-gray-400">
          © 2026 BiteDash Food Delivery. Crafted with flavor by Akhil Verma.
        </div>
      </footer>

      <AnimatePresence>
        {legalModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModal(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[95]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[100] overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50">
                <h3 className="text-xl font-bold">
                  {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
                </h3>
                <button
                  onClick={() => setLegalModal(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[65vh] overflow-y-auto text-sm text-gray-700 space-y-3">
                {legalModal === 'privacy' ? (
                  <>
                    <p>We collect only order-required details like name, address, pincode, mobile number, and order history to fulfill deliveries.</p>
                    <p>Any misuse such as fake-time ordering, fake cancellation attempts, or false delivery information is strictly not allowed.</p>
                    <p>Suspicious or abusive activity may lead to account restriction or cancellation of pending orders.</p>
                    <p>If you find any incorrect information, unauthorized activity, or privacy concern, contact us immediately:</p>
                    <p className="font-medium">Admin Phone: +91 98765 43210 | Admin Email: admin@bitedash.com</p>
                  </>
                ) : (
                  <>
                    <p>All delivery details must be complete and valid: recipient name, full address, pincode, and mobile number.</p>
                    <p>If delivery details are missing or incorrect and order cannot be fulfilled, customer may choose either:</p>
                    <p>1. Full refund, or</p>
                    <p>2. Place the order again with correct details.</p>
                    <p>Fraudulent orders, fake cancellations, or repeated invalid information may be rejected without service.</p>
                    <p>For support related to refunds or reorders, contact:</p>
                    <p className="font-medium">Admin Phone: +91 98765 43210 | Admin Email: admin@bitedash.com</p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FoodCard({ item, onAdd }: { item: FoodItem, onAdd: () => void, key?: React.Key }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl border border-black/5 overflow-hidden group shadow-sm hover:shadow-xl transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star size={12} className="text-yellow-500 fill-yellow-500" /> 4.8
        </div>
        <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {item.category}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
          <span className="font-bold text-emerald-600">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock size={14} /> 20-30 min</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> 1.2 km</span>
          </div>
          <button 
            onClick={onAdd}
            className="p-3 bg-black text-white rounded-2xl hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function OrdersView() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedOrders.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please check your Firestore rules and indexes.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="py-12 text-center text-gray-500">Loading your orders...</div>;
  if (error) return (
    <div className="py-12 text-center text-red-500">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-black text-white rounded-full text-sm">Retry</button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-4xl font-bold tracking-tight">My Orders</h2>
        <p className="text-gray-500">Track and manage your recent orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-black/5 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="font-bold">No orders yet</p>
          <p className="text-sm text-gray-500">Looks like you haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Package className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="font-bold text-sm">Order #{order.id}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                  {order.delivery_details?.recipient_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Deliver to: {order.delivery_details.recipient_name} ({order.delivery_for === 'other' ? 'Someone else' : 'Myself'})
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                  <p className="font-bold text-emerald-600">${order.total_price.toFixed(2)}</p>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest",
                  order.status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                  order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                  "bg-red-50 text-red-600"
                )}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function AdminPanel({ user, menuItems, setMenuItems }: { user: AppUser, menuItems: FoodItem[], setMenuItems: (items: FoodItem[]) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', image_url: '', category: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeAdminTab, setActiveAdminTab] = useState<'menu' | 'orders' | 'partners'>('menu');
  const [orders, setOrders] = useState<any[]>([]);
  const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isProcessingPartner, setIsProcessingPartner] = useState<string | null>(null);
  const hasFullAdminAccess = user?.adminScope !== 'own';

  const handleAddClick = () => {
    setEditingItem(null);
    setForm({ name: '', description: '', price: '', image_url: '', category: '' });
    setFormErrors({});
    setIsAdding(true);
  };

  const handleEditClick = (item: FoodItem) => {
    setEditingItem(item);
    setForm({ ...item, price: item.price.toString() });
    setFormErrors({});
    setIsAdding(true);
  };

  const handleCloseModal = () => {
    setIsAdding(false);
    setEditingItem(null);
    setForm({ name: '', description: '', price: '', image_url: '', category: '' });
    setFormErrors({});
  };

  useEffect(() => {
    if (activeAdminTab !== 'orders') return;

    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedOrders.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(fetchedOrders);
      },
      (err) => {
        console.error('Admin fetch orders error:', err);
      }
    );

    return () => unsubscribe();
  }, [activeAdminTab]);

  useEffect(() => {
    if (activeAdminTab !== 'partners') return;

    const unsubscribe = onSnapshot(
      collection(db, 'partner_applications'),
      (querySnapshot) => {
        const applications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applications.sort((a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setPartnerRequests(applications);
      },
      (err) => {
        console.error('Partner request fetch error:', err);
      }
    );

    return () => unsubscribe();
  }, [activeAdminTab]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      errors.name = 'Item name is required';
    } else if (form.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    const priceNum = parseFloat(form.price);
    if (!form.price) {
      errors.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a positive number';
    }

    if (!form.category) {
      errors.category = 'Please select a category';
    }

    if (!form.image_url.trim()) {
      errors.image_url = 'Image URL is required';
    } else {
      try {
        new URL(form.image_url);
      } catch {
        errors.image_url = 'Please enter a valid URL';
      }
    }

    if (!form.description.trim()) {
      errors.description = 'Description is required';
    } else if (form.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const priceNum = parseFloat(form.price);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        image_url: form.image_url.trim(),
        category: form.category,
        created_by: editingItem?.created_by || user.id,
        created_by_name: user.name
      };

      if (editingItem) {
        if (!hasFullAdminAccess && editingItem.created_by !== user.id) {
          alert('You can edit only menu items created by you.');
          return;
        }
        await updateDoc(doc(db, 'menu', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'menu'), payload);
      }
      
      // Refresh menu
      const querySnapshot = await getDocs(collection(db, 'menu'));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
      setMenuItems(items);
      
      handleCloseModal();
      alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
    } catch (err) {
      alert('Failed to save item. Please check your permissions.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const itemToDelete = menuItems.find(i => i.id === id);
      if (!hasFullAdminAccess && itemToDelete?.created_by !== user.id) {
        alert('You can delete only menu items created by you.');
        return;
      }
      await deleteDoc(doc(db, 'menu', id));
      setMenuItems(menuItems.filter(i => i.id !== id));
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const fetchOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    // In our Firestore setup, items are already in the order document
    setOrderDetails(order.items || []);
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = hasFullAdminAccess || item.created_by === user.id;
    return matchesQuery && matchesScope;
  });

  const filteredOrders = orders.filter(order => 
    order.id.includes(searchQuery) || 
    (order.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPartnerRequests = partnerRequests.filter((request) => {
    const q = searchQuery.toLowerCase();
    return (
      (request.email || '').toLowerCase().includes(q) ||
      (request.contact_name || '').toLowerCase().includes(q) ||
      (request.restaurant_name || '').toLowerCase().includes(q) ||
      (request.status || '').toLowerCase().includes(q)
    );
  });

  const confirmPartnerRequest = async (request: any) => {
    try {
      setIsProcessingPartner(request.id);
      const emailLower = (request.email_lower || request.email || '').toLowerCase();
      if (!emailLower) {
        alert('Partner request email is missing.');
        return;
      }

      await updateDoc(doc(db, 'partner_applications', request.id), {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id
      });

      const usersByEmailLower = query(collection(db, 'users'), where('email_lower', '==', emailLower));
      const lowerSnapshot = await getDocs(usersByEmailLower);
      if (!lowerSnapshot.empty) {
        await Promise.all(
          lowerSnapshot.docs.map((userDoc) =>
            setDoc(
              doc(db, 'users', userDoc.id),
              { role: 'admin', admin_scope: 'own' },
              { merge: true }
            )
          )
        );
      } else if (request.email) {
        const usersByEmail = query(collection(db, 'users'), where('email', '==', request.email));
        const emailSnapshot = await getDocs(usersByEmail);
        if (!emailSnapshot.empty) {
          await Promise.all(
            emailSnapshot.docs.map((userDoc) =>
              setDoc(
                doc(db, 'users', userDoc.id),
                { role: 'admin', admin_scope: 'own', email_lower: emailLower },
                { merge: true }
              )
            )
          );
        }
      }

      alert('Partner confirmed. This user can now access Admin Panel with own-item permissions.');
    } catch (err) {
      alert('Failed to confirm partner request.');
    } finally {
      setIsProcessingPartner(null);
    }
  };

  const handleSeedData = async () => {
    const sampleItems = [
      // Burgers
      { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, and house sauce.', price: 12.99, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Smoky BBQ Burger', description: 'Char-grilled beef, onion rings, cheddar, and smoky BBQ sauce.', price: 14.49, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mushroom Swiss Burger', description: 'Sauteed mushrooms, swiss cheese, and garlic aioli.', price: 13.99, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80' },
      { name: 'Crispy Chicken Burger', description: 'Crispy fried chicken breast with slaw and spicy mayo.', price: 13.49, category: 'Burgers', image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80' },

      // Pizza
      { name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, and tomato sauce on thin crust.', price: 14.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Pepperoni Pizza', description: 'Classic pepperoni with rich mozzarella and house tomato base.', price: 15.49, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
      { name: 'BBQ Chicken Pizza', description: 'Grilled chicken, red onions, and sweet smoky BBQ drizzle.', price: 16.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
      { name: 'Veggie Supreme Pizza', description: 'Bell peppers, olives, onions, corn, and mozzarella cheese.', price: 15.99, category: 'Pizza', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },

      // Japanese
      { name: 'Dragon Roll', description: 'Shrimp tempura, cucumber, avocado, and eel sauce.', price: 16.99, category: 'Japanese', image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80' },
      { name: 'Salmon Sashimi', description: 'Fresh salmon sashimi slices with wasabi and soy.', price: 18.49, category: 'Japanese', image_url: 'https://images.unsplash.com/photo-1534482421-0d45a48a73fe?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tempura Udon Bowl', description: 'Udon noodles in savory broth with crispy shrimp tempura.', price: 15.99, category: 'Japanese', image_url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chicken Katsu Curry', description: 'Crispy chicken cutlet served with Japanese curry and rice.', price: 17.49, category: 'Japanese', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },

      // Indian
      { name: 'Butter Chicken', description: 'Tender chicken in creamy tomato-butter gravy.', price: 14.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chole Bhature', description: 'Spiced chickpea curry served with fluffy fried bhatura bread.', price: 12.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1626132647523-66d88d66ef95?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chicken Biryani', description: 'Aromatic basmati rice with marinated chicken and spices.', price: 13.49, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in silky tomato-cashew gravy.', price: 13.99, category: 'Indian', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },

      // South Indian
      { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato masala.', price: 9.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80' },
      { name: 'Idli Sambar', description: 'Steamed rice cakes served with sambar and chutneys.', price: 8.49, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80' },
      { name: 'Medu Vada', description: 'Crispy lentil donuts served with coconut chutney.', price: 8.99, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
      { name: 'Uttapam', description: 'Thick savory pancake topped with onions, tomato, and chilies.', price: 9.49, category: 'South Indian', image_url: 'https://images.unsplash.com/photo-1630409351217-bc4fa6422075?auto=format&fit=crop&w=800&q=80' },

      // Chinese
      { name: 'Veg Hakka Noodles', description: 'Classic Indo-Chinese noodles stir-fried with crunchy veggies.', price: 10.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chilli Chicken', description: 'Crispy chicken tossed in spicy Indo-Chinese gravy.', price: 12.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Veg Manchurian', description: 'Vegetable dumplings in tangy and spicy Manchurian sauce.', price: 11.49, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' },
      { name: 'Schezwan Fried Rice', description: 'Popular spicy fried rice tossed with schezwan sauce.', price: 10.99, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80' },

      // Salads
      { name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons, and Caesar dressing.', price: 10.99, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Greek Salad', description: 'Tomato, cucumber, olives, feta, and olive oil dressing.', price: 11.49, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80' },
      { name: 'Avocado Quinoa Salad', description: 'Quinoa, avocado, greens, and lemon-herb vinaigrette.', price: 12.99, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mediterranean Chickpea Salad', description: 'Chickpeas, cucumber, tomato, herbs, and olive dressing.', price: 12.49, category: 'Salads', image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80' },

      // Pasta
      { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with garlic and chili flakes.', price: 13.99, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Creamy Alfredo Pasta', description: 'Fettuccine in rich parmesan cream sauce.', price: 14.99, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Seafood Linguine', description: 'Linguine tossed with shrimp, mussels, and garlic sauce.', price: 17.99, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Spaghetti Bolognese', description: 'Classic spaghetti in slow-cooked meat tomato sauce.', price: 15.49, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80' },

      // Breakfast
      { name: 'Avocado Toast', description: 'Sourdough toast topped with smashed avocado and herbs.', price: 9.99, category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Pancake Stack', description: 'Fluffy pancakes with maple syrup and seasonal berries.', price: 10.99, category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80' },
      { name: 'Eggs Benedict', description: 'Poached eggs, toasted muffin, and hollandaise sauce.', price: 12.49, category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1533089860892-a9ae04b6a2df?auto=format&fit=crop&w=800&q=80' },
      { name: 'Masala Omelette Toast', description: 'Indian-spiced omelette with buttered toast.', price: 9.49, category: 'Breakfast', image_url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80' },

      // Steak
      { name: 'Ribeye Steak', description: '12oz ribeye grilled with garlic herb butter.', price: 28.99, category: 'Steak', image_url: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80' },
      { name: 'Filet Mignon', description: 'Tender filet with red wine jus and roasted vegetables.', price: 31.99, category: 'Steak', image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80' },
      { name: 'Peppercorn Steak', description: 'Seared steak with peppercorn sauce and mashed potatoes.', price: 29.49, category: 'Steak', image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80' },
      { name: 'T-Bone Steak', description: 'Juicy T-bone steak with sauteed greens and jus.', price: 33.49, category: 'Steak', image_url: 'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?auto=format&fit=crop&w=800&q=80' },

      // Seafood
      { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter and greens.', price: 19.99, category: 'Seafood', image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80' },
      { name: 'Fish and Chips', description: 'Crispy battered cod with fries and tartar dip.', price: 15.99, category: 'Seafood', image_url: 'https://images.unsplash.com/photo-1524593689594-aae2f26b75ab?auto=format&fit=crop&w=800&q=80' },
      { name: 'Garlic Butter Prawns', description: 'Sauteed prawns in garlic butter with toasted bread.', price: 18.99, category: 'Seafood', image_url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lemon Herb Grilled Fish', description: 'White fish fillet grilled with lemon and herbs.', price: 17.99, category: 'Seafood', image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?auto=format&fit=crop&w=800&q=80' },

      // Vegan
      { name: 'Vegan Buddha Bowl', description: 'Quinoa, roasted veggies, chickpeas, and tahini dressing.', price: 13.99, category: 'Vegan', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vegan Burger', description: 'Plant-based patty with lettuce, tomato, and vegan mayo.', price: 14.49, category: 'Vegan', image_url: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tofu Stir Fry', description: 'Crispy tofu with mixed vegetables in sesame soy glaze.', price: 12.99, category: 'Vegan', image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vegan Burrito Bowl', description: 'Brown rice, beans, corn salsa, and avocado.', price: 13.49, category: 'Vegan', image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80' },

      // Beverages
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice, no added sugar.', price: 4.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80' },
      { name: 'Iced Caramel Latte', description: 'Espresso, milk, and caramel syrup served over ice.', price: 5.49, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80' },
      { name: 'Berry Smoothie', description: 'Mixed berries, banana, and yogurt blended chilled.', price: 5.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mango Lassi', description: 'Traditional yogurt mango drink served chilled.', price: 4.99, category: 'Beverages', image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80' },

      // Desserts
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center.', price: 7.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80' },
      { name: 'New York Cheesecake', description: 'Creamy cheesecake with buttery biscuit base.', price: 7.49, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tiramisu Cup', description: 'Coffee-soaked sponge layered with mascarpone cream.', price: 7.99, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Gulab Jamun Sundae', description: 'Warm gulab jamun with vanilla ice cream and nuts.', price: 8.49, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80' }
    ];

    try {
      for (const item of sampleItems) {
        const itemId = item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        await setDoc(doc(db, 'menu', itemId), item);
      }
      const querySnapshot = await getDocs(collection(db, 'menu'));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));
      setMenuItems(items);
      alert('Sample data seeded successfully!');
    } catch (err) {
      alert('Failed to seed data. Check your Firestore rules.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-gray-500">Manage your restaurant menu and orders.</p>
        </div>
        <div className="flex gap-2">
          {hasFullAdminAccess && (
            <button 
              onClick={handleSeedData}
              className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-all"
            >
              Seed/Refresh Sample Data
            </button>
          )}
          <button 
            onClick={() => setActiveAdminTab('menu')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeAdminTab === 'menu' ? "bg-black text-white" : "bg-white border border-black/5 hover:bg-gray-50"
            )}
          >
            Menu
          </button>
          <button 
            onClick={() => setActiveAdminTab('orders')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeAdminTab === 'orders' ? "bg-black text-white" : "bg-white border border-black/5 hover:bg-gray-50"
            )}
          >
            Orders
          </button>
          {hasFullAdminAccess && (
            <button
              onClick={() => setActiveAdminTab('partners')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                activeAdminTab === 'partners' ? "bg-black text-white" : "bg-white border border-black/5 hover:bg-gray-50"
              )}
            >
              Partners
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeAdminTab === 'menu' ? (
          <motion.div 
            key="menu-mgmt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search menu items..." 
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-black/5 bg-white focus:outline-none focus:border-emerald-600 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={handleAddClick}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} /> Add New Item
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Item</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Category</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Price</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredMenu.length > 0 ? (
                      filteredMenu.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'} 
                                alt="" 
                                className="w-10 h-10 rounded-lg object-cover border border-black/5" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              <span className="font-bold text-sm">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                          <td className="px-6 py-4 text-sm font-bold">${item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                          No menu items found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeAdminTab === 'orders' ? (
          <motion.div 
            key="orders-mgmt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders by ID, customer, or status..." 
                className="w-full pl-12 pr-12 py-3 rounded-2xl border border-black/5 bg-white focus:outline-none focus:border-emerald-600 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Total</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => fetchOrderDetails(order)}
                        >
                          <td className="px-6 py-4 font-bold text-sm">#{order.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{order.user_name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">${order.total_price.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              order.status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                              order.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                              "bg-red-50 text-red-600"
                            )}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); fetchOrderDetails(order); }}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'completed'); }}
                              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled'); }}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                          No orders found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="partners-mgmt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search partner requests..."
                className="w-full pl-12 pr-12 py-3 rounded-2xl border border-black/5 bg-white focus:outline-none focus:border-emerald-600 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-black/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Restaurant</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredPartnerRequests.length > 0 ? (
                      filteredPartnerRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold">{request.restaurant_name || '-'}</td>
                          <td className="px-6 py-4 text-sm">{request.contact_name || '-'}</td>
                          <td className="px-6 py-4 text-sm">{request.email || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              request.status === 'confirmed' ? "bg-emerald-50 text-emerald-700" :
                              request.status === 'rejected' ? "bg-red-50 text-red-600" :
                              "bg-amber-50 text-amber-700"
                            )}>
                              {request.status || 'new'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {request.status === 'confirmed' ? (
                              <span className="text-xs text-emerald-700 font-semibold">Confirmed</span>
                            ) : (
                              <button
                                onClick={() => confirmPartnerRequest(request)}
                                disabled={isProcessingPartner === request.id}
                                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all"
                              >
                                {isProcessingPartner === request.id ? 'Confirming...' : 'Confirm & Grant Access'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                          No partner requests found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[80] overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold">Order Details #{selectedOrder.id}</h3>
                  <p className="text-sm text-gray-500">Customer: {selectedOrder.user_name}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isLoadingDetails ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading order items...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          selectedOrder.status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                          selectedOrder.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">${selectedOrder.total_price.toFixed(2)}</p>
                      </div>
                    </div>

                    {selectedOrder.delivery_details && (
                      <div className="p-4 rounded-2xl border border-black/10 bg-gray-50 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Delivery Information</p>
                        <p className="text-sm"><span className="font-semibold">Type:</span> {selectedOrder.delivery_for === 'other' ? 'Someone Else' : 'Myself'}</p>
                        <p className="text-sm"><span className="font-semibold">Recipient:</span> {selectedOrder.delivery_details.recipient_name}</p>
                        <p className="text-sm"><span className="font-semibold">Mobile:</span> {selectedOrder.delivery_details.mobile}</p>
                        <p className="text-sm"><span className="font-semibold">Pincode:</span> {selectedOrder.delivery_details.pincode}</p>
                        <p className="text-sm"><span className="font-semibold">Address:</span> {selectedOrder.delivery_details.address}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Items</p>
                      {orderDetails.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-black/5 hover:bg-gray-50 transition-colors">
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-black/5 flex gap-3">
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  disabled={selectedOrder.status === 'completed'}
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Mark as Completed
                </button>
                <button 
                  onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                  disabled={selectedOrder.status === 'cancelled'}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Cancel Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white p-8 rounded-3xl z-[90] shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Item Name</label>
                    <input 
                      type="text"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none transition-all",
                        formErrors.name ? "border-red-500 focus:border-red-500" : "border-black/5 focus:border-emerald-600"
                      )}
                      value={form.name}
                      onChange={e => {
                        setForm({...form, name: e.target.value});
                        if (formErrors.name) setFormErrors({...formErrors, name: ''});
                      }}
                    />
                    {formErrors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Price ($)</label>
                    <input 
                      type="text"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none transition-all",
                        formErrors.price ? "border-red-500 focus:border-red-500" : "border-black/5 focus:border-emerald-600"
                      )}
                      value={form.price}
                      onChange={e => {
                        setForm({...form, price: e.target.value});
                        if (formErrors.price) setFormErrors({...formErrors, price: ''});
                      }}
                    />
                    {formErrors.price && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Category</label>
                    <select 
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none transition-all",
                        formErrors.category ? "border-red-500 focus:border-red-500" : "border-black/5 focus:border-emerald-600"
                      )}
                      value={form.category}
                      onChange={e => {
                        setForm({...form, category: e.target.value});
                        if (formErrors.category) setFormErrors({...formErrors, category: ''});
                      }}
                    >
                      <option value="">Select Category</option>
                      {MENU_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.category}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Image URL</label>
                    <input 
                      type="text"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none transition-all",
                        formErrors.image_url ? "border-red-500 focus:border-red-500" : "border-black/5 focus:border-emerald-600"
                      )}
                      value={form.image_url}
                      onChange={e => {
                        setForm({...form, image_url: e.target.value});
                        if (formErrors.image_url) setFormErrors({...formErrors, image_url: ''});
                      }}
                    />
                    {formErrors.image_url && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.image_url}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none transition-all",
                        formErrors.description ? "border-red-500 focus:border-red-500" : "border-black/5 focus:border-emerald-600"
                      )}
                      value={form.description}
                      onChange={e => {
                        setForm({...form, description: e.target.value});
                        if (formErrors.description) setFormErrors({...formErrors, description: ''});
                      }}
                    />
                    {formErrors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.description}</p>}
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all"
                  >
                    {editingItem ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PartnerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [form, setForm] = useState({ restaurantName: '', contactName: '', email: '', phone: '', cuisine: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'exists'>('idle');
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setStatus('submitting');
    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const existingQuery = query(
        collection(db, 'partner_applications'),
        where('email_lower', '==', normalizedEmail)
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        setStatus('exists');
        return;
      }

      await addDoc(collection(db, 'partner_applications'), {
        restaurant_name: form.restaurantName.trim(),
        contact_name: form.contactName.trim(),
        email: form.email.trim(),
        email_lower: normalizedEmail,
        phone: form.phone.trim(),
        cuisine: form.cuisine.trim(),
        created_at: new Date().toISOString(),
        status: 'new'
      });

      setStatus('success');
      setForm({ restaurantName: '', contactName: '', email: '', phone: '', cuisine: '' });
    } catch (err) {
      setStatus('idle');
      setSubmitError('Failed to submit request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Partner with us</h2>
                <p className="text-gray-500 mt-1">Grow your business with BiteDash</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold">Application Sent!</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Thank you for your interest. Our partnership team will contact you within 2-3 business days.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-6 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
              </motion.div>
            ) : status === 'exists' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <XCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold">Application Already Exists</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  A partner request with this email is already submitted.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-6 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-400 transition-all"
                  >
                    Try Different Email
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Restaurant Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="e.g. Pizza Palace"
                      value={form.restaurantName}
                      onChange={e => setForm({...form, restaurantName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Cuisine Type</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="e.g. Italian"
                      value={form.cuisine}
                      onChange={e => setForm({...form, cuisine: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:border-emerald-600 transition-all"
                    placeholder="Your full name"
                    value={form.contactName}
                    onChange={e => setForm({...form, contactName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-black/5 focus:outline-none focus:border-emerald-600 transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  disabled={status === 'submitting'}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
                {submitError && (
                  <p className="text-red-600 text-xs font-medium text-center">{submitError}</p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
