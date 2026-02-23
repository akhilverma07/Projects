
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
         <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">FLOWER <span className="text-[#e84393]">STORE</span></h2>
            <p className="text-zinc-400 leading-relaxed text-sm mb-8">
              Bringing the beauty of nature to your lifestyle. We provide fresh, premium flowers 
              sourced from the best farms around the world.
            </p>
            <div className="flex gap-4">
               {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[#e84393] transition-colors">
                     <i className={`fab fa-${social}`}></i>
                  </a>
               ))}
            </div>
         </div>
         
         <div>
            <h3 className="text-xl font-bold mb-8">Quick Links</h3>
            <ul className="space-y-4 text-zinc-400">
               <li><a href="#home" onClick={(e) => handleSectionClick(e, 'home')} className="hover:text-[#e84393]">Home</a></li>
               <li><a href="#about" onClick={(e) => handleSectionClick(e, 'about')} className="hover:text-[#e84393]">About</a></li>
               <li><Link to="/shop" className="hover:text-[#e84393]">Products</Link></li>
               <li><a href="#review" onClick={(e) => handleSectionClick(e, 'review')} className="hover:text-[#e84393]">Review</a></li>
            </ul>
         </div>

         <div>
            <h3 className="text-xl font-bold mb-8">Extra Links</h3>
            <ul className="space-y-4 text-zinc-400">
               <li><a href="#" className="hover:text-[#e84393]">My Account</a></li>
               <li><a href="#" className="hover:text-[#e84393]">My Orders</a></li>
               <li><a href="#" className="hover:text-[#e84393]">Privacy Policy</a></li>
               <li><a href="#" className="hover:text-[#e84393]">Terms of Use</a></li>
            </ul>
         </div>

         <div>
            <h3 className="text-xl font-bold mb-8">Contact Info</h3>
            <ul className="space-y-4 text-zinc-400">
               <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#e84393]" /> +123-456-7890</li>
               <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#e84393]" /> info@flowerstore.com</li>
               <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#e84393]" /> Mumbai, India - 400010</li>
            </ul>
         </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-zinc-800 text-center text-sm text-zinc-500">
         <p>Created by <span className="text-[#e84393] font-bold">Akhil Verma</span> | &copy; 2025 All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
