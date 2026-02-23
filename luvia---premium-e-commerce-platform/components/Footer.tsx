
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        <div>
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase mb-8">LUVIA</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            Defining the modern wardrobe since 2025. Crafted with precision, worn with confidence.
          </p>
          <div className="flex space-x-4">
            <Instagram className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
            <Twitter className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
            <Facebook className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-8">Collections</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li><Link to="/shop?cat=New Arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop?cat=Mens" className="hover:text-white transition-colors">Menswear</Link></li>
            <li><Link to="/shop?cat=Womens" className="hover:text-white transition-colors">Womenswear</Link></li>
            <li><Link to="/shop?cat=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-8">Customer Care</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li><button className="hover:text-white transition-colors">Contact Us</button></li>
            <li><button className="hover:text-white transition-colors">Shipping & Returns</button></li>
            <li><button className="hover:text-white transition-colors">Size Guide</button></li>
            <li><button className="hover:text-white transition-colors">Sustainability</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest font-bold mb-8">Boutiques</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li>London, New Bond Street</li>
            <li>Paris, Avenue Montaigne</li>
            <li>New York, Fifth Avenue</li>
            <li>Milan, Via Montenapoleone</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-zinc-600">
        <p>© 2025 LUVIA LUXURY LTD. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-8 mt-6 md:mt-0">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
          <button>Cookies</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
