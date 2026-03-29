import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const { cartCount, wishlist } = useShop();
  const { user } = useAuth();

  const links = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/products' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', badge: wishlist.length },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: User, label: 'Profile', path: user ? '/account' : '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-xl border-t border-white/10 px-4 py-3">
      <div className="flex justify-between items-center">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 relative transition-all ${
                isActive ? 'text-brand-red' : 'text-white/40'
              }`
            }
          >
            <link.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{link.label}</span>
            {link.badge !== undefined && link.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
