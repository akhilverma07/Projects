import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, isAdmin } = useAuth();
  const { addNewsletterSubscriber } = useOrders();
  const dashboardPath = isAdmin ? '/admin' : user ? '/account' : '/login';
  const orderStatusPath = user ? '/account' : '/login';
  const orderItemsPath = user ? '/cart' : '/login';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterMessage('');

    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setNewsletterMessage('Enter a valid email address.');
      return;
    }

    try {
      const result = await addNewsletterSubscriber(email);
      setNewsletterMessage(result.status === 'exists' ? 'This email is already subscribed.' : 'Subscribed successfully. The email is now visible in the admin dashboard.');
      if (result.status === 'created') {
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterMessage('Unable to subscribe right now. Please try again.');
    }
  };

  return (
    <footer className="bg-brand-gray pt-16 pb-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link
              to="/"
              className="group relative flex w-fit flex-col overflow-hidden rounded-2xl px-1 py-1 transition-transform duration-300 hover:scale-[1.03]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-red/0 via-brand-red/10 to-amber-300/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative text-[1.95rem] font-black uppercase tracking-[0.22em] text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                SP & THEIR SONS
              </span>
              <span className="relative text-[10px] font-bold uppercase tracking-[0.42em] text-brand-red transition-all duration-300 group-hover:tracking-[0.5em]">
                Legacy Since 1970
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Crafting excellence for over 57 years. Our legacy is built on quality, trust, and the pursuit of the perfect step.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-red transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/50 hover:text-brand-red text-sm transition-colors">Home</Link></li>
              <li><Link to={dashboardPath} className="text-white/50 hover:text-brand-red text-sm transition-colors">Dashboard</Link></li>
              <li><Link to="/products" className="text-white/50 hover:text-brand-red text-sm transition-colors">Products</Link></li>
              <li><Link to={orderStatusPath} className="text-white/50 hover:text-brand-red text-sm transition-colors">Order Status</Link></li>
              <li><Link to={orderItemsPath} className="text-white/50 hover:text-brand-red text-sm transition-colors">Order Items</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Policies</h4>
            <ul className="space-y-4">
              <li><Link to="/policies/shipping" className="text-white/50 hover:text-brand-red text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link to="/policies/refund" className="text-white/50 hover:text-brand-red text-sm transition-colors">Refund Policy</Link></li>
              <li><Link to="/policies/return" className="text-white/50 hover:text-brand-red text-sm transition-colors">Return Policy</Link></li>
              <li><Link to="/policies/privacy" className="text-white/50 hover:text-brand-red text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="text-white/50 hover:text-brand-red text-sm transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Get In Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-white/50 text-sm">
                <MapPin size={18} className="text-brand-red shrink-0" />
                <span>
                  Legacy Street, Footwear &amp; Clothing Hub
                  <br />
                  Paras Road, Parasrampur, Gopinathpur
                  <br />
                  In front of Nathpur Gate
                  <br />
                  Pincode: 272130
                </span>
              </div>
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <Phone size={18} className="text-brand-red shrink-0" />
                <a href="tel:+919919576275" className="transition-colors hover:text-brand-red">
                  +91 9919576275
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <Mail size={18} className="text-brand-red shrink-0" />
                <a href="mailto:rpverma0786@gmail.com" className="transition-colors hover:text-brand-red break-all">
                  rpverma0786@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-white/50 text-sm">
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-red/10 text-[10px] font-black text-brand-red">
                  GST
                </span>
                <span>GSTIN: 09ABCDE1234F1Z5</span>
              </div>
            </div>
            <div className="pt-4">
              <h5 className="text-white text-xs font-bold uppercase mb-3">Newsletter</h5>
              <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Your email"
                    className="bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-brand-red w-full"
                  />
                  <button type="submit" className="bg-brand-red px-4 py-2 text-sm font-bold hover:bg-red-700 transition-colors">
                    JOIN
                  </button>
                </div>
                {newsletterMessage ? (
                  <p className="text-xs text-white/50">{newsletterMessage}</p>
                ) : null}
              </form>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/30 text-xs">
            © {currentYear} SP & Their Sons. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-30 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-30 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-30 grayscale" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
