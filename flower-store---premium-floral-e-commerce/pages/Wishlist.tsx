
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useApp } from '../App';
import ProductCard from '../components/ProductCard';

const Wishlist: React.FC = () => {
  const { wishlist } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 bg-white border-b">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="p-4 bg-[#e84393]/10 rounded-full mb-6">
            <Heart className="w-8 h-8 text-[#e84393] fill-[#e84393]" />
          </div>
          <h1 className="text-5xl font-serif mb-4">Your Wishlist</h1>
          <p className="text-zinc-500 text-sm max-w-lg text-center leading-relaxed">
            Keep track of the blooms you love. Save your favorites here and add them to your bag when you're ready to brighten someone's day.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <div className="flex justify-center mb-6">
               <div className="p-8 bg-zinc-100 rounded-full">
                  <Heart className="w-12 h-12 text-zinc-300" />
               </div>
            </div>
            <h2 className="text-2xl font-serif mb-4">Wishlist is Empty</h2>
            <p className="text-zinc-400 mb-10">You haven't saved any flowers to your wishlist yet.</p>
            <Link to="/shop" className="btn-primary flex items-center justify-center gap-2 mx-auto w-fit">
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
