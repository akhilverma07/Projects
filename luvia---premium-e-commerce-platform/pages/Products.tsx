
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('Newest');
  
  const initialCat = searchParams.get('cat') || 'All';

  useEffect(() => {
    mockApi.getProducts().then(setProducts);
  }, []);

  useEffect(() => {
    let result = [...products];
    if (initialCat !== 'All' && initialCat !== 'New Arrivals') {
      result = result.filter(p => p.category === initialCat);
    }
    
    // Simple mock sorting
    if (sortBy === 'Price: Low to High') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') result.sort((a, b) => b.price - a.price);

    setFilteredProducts(result);
  }, [products, initialCat, sortBy]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="pt-24 pb-12 px-6 border-b">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl font-serif mb-6">{initialCat === 'All' ? 'Our Collection' : initialCat}</h1>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.4em]">{filteredProducts.length} Results</p>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-16 bg-white/80 backdrop-blur-md z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest hover:text-zinc-500">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest hover:text-zinc-500">
              <span>Sort: {sortBy}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {['Newest', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className="block w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
