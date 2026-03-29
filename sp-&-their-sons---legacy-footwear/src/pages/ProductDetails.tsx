import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Star, Heart, ShoppingCart, ChevronRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductCard from '../components/ProductCard';
import ProductImageCarousel from '../components/ProductImageCarousel';
import { useProducts } from '../context/ProductContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const { products } = useProducts();
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  useEffect(() => {
    if (product) {
      setSelectedSize(null);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <h2 className="text-3xl font-black">Product Not Found</h2>
        <Link to="/products" className="bg-brand-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = products
    .filter(p => p.mainCategory === product.mainCategory && p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
  };

  return (
    <div className="pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
          <Link to="/" className="hover:text-white">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-white">Products</Link>
          <ChevronRight size={12} />
          <span className="text-brand-red">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Gallery Carousel */}
          <ProductImageCarousel images={product.images} name={product.name} />

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-brand-red text-xs font-black uppercase tracking-[0.3em]">{product.category}</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-white/40 font-medium">({product.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-black text-white">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-white/30 line-through">₹{product.originalPrice}</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-brand-red text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                    Save {product.discount}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/60 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest">Select Size ({product.gender})</h3>
                <button className="text-[10px] font-bold text-brand-red uppercase border-b border-brand-red">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-xl text-sm font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-white text-black border-white'
                        : 'bg-brand-gray border-white/10 text-white hover:border-brand-red'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-brand-red text-white h-16 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-brand-red/20"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  if (isWishlisted) removeFromWishlist(product.id);
                  else addToWishlist(product);
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${
                  isWishlisted ? 'bg-white text-black border-white' : 'bg-brand-gray border-white/10 text-white hover:border-brand-red'
                }`}
              >
                <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-brand-red" />
                <span className="text-[10px] font-bold uppercase text-white/40">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw size={20} className="text-brand-red" />
                <span className="text-[10px] font-bold uppercase text-white/40">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-brand-red" />
                <span className="text-[10px] font-bold uppercase text-white/40">Legacy Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-24">
          <div className="flex border-b border-white/5 mb-12">
            {[
              { id: 'description', label: 'Description' },
              { id: 'reviews', label: `Reviews (${product.reviews})` },
              { id: 'shipping', label: 'Shipping & Returns' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-brand-red" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-6 text-white/60 leading-relaxed">
                <p>{product.description}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Premium leather upper for durability and style</li>
                  <li>Cushioned insole for all-day comfort</li>
                  <li>Non-slip rubber outsole for superior traction</li>
                  <li>Breathable lining to keep feet fresh</li>
                  <li>Legacy craftsmanship since 1970</li>
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-brand-gray p-8 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-red/20 flex items-center justify-center font-black text-brand-red">
                          JD
                        </div>
                        <div>
                          <h4 className="font-bold">John Doe</h4>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-white/30">2 weeks ago</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Absolutely amazing quality! You can really feel the 57 years of experience in the craftsmanship. The fit is perfect and they look even better in person.
                    </p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="max-w-3xl space-y-6 text-white/60 leading-relaxed">
                <h4 className="text-white font-bold">Standard Shipping</h4>
                <p>Free standard shipping on all orders over ₹150. Delivery typically takes 3-5 business days.</p>
                <h4 className="text-white font-bold">Easy Returns</h4>
                <p>Not the right fit? No problem. We offer a 30-day return policy for all unworn items in their original packaging.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-32">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-4">
              <span className="text-brand-red text-xs font-bold uppercase tracking-[0.3em]">You Might Also Like</span>
              <h2 className="text-4xl font-black tracking-tight">RELATED PRODUCTS</h2>
            </div>
            <Link to="/products" className="text-white/60 hover:text-brand-red transition-colors text-sm font-bold uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
