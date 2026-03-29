import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import MobileBottomNav from './components/MobileBottomNav';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import PolicyPage from './pages/PolicyPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const LoginPage = () => {
  const { user, loading, login, register, authSetupError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/account'} />;

  const updateField = (field: 'name' | 'email' | 'password', value: string) => {
    setError('');
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Something went wrong.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-gray p-10 rounded-3xl border border-white/5 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter">{mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</h2>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Sign in to your legacy account' : 'Register for a new legacy account'}
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-gray px-2 text-white/40 tracking-widest">Account Access</span></div>
        </div>
        {authSetupError && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {authSetupError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-dark p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'login' ? 'bg-brand-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === 'register' ? 'bg-brand-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
                placeholder="Your full name"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-brand-red transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-brand-red text-white h-14 rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-60"
          >
            {submitting || loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="rounded-2xl border border-white/10 bg-brand-dark/60 p-4 text-xs text-white/50 space-y-1">
          <p className="font-black uppercase tracking-widest text-white/70">Admin Account</p>
          <p>Name: Akhil Verma</p>
          <p>Email: a********@gmail.com</p>
          <p>Password: #####@123</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-brand-red font-bold"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <ProductProvider>
          <ShopProvider>
            <Router>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/account" element={<UserDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/policies/:type" element={<PolicyPage />} />
                  </Routes>
                </main>
                <Footer />
                <ScrollToTop />
                <MobileBottomNav />
              </div>
            </Router>
          </ShopProvider>
        </ProductProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
