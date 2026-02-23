
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, BarChart3, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Product, Order } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  useEffect(() => {
    mockApi.getProducts().then(setProducts);
    mockApi.getOrders().then(setOrders);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await mockApi.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-serif">Management Dashboard</h1>
            <p className="text-zinc-500 text-sm">Control center for LUVIA inventory and logistics.</p>
          </div>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Product
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Sales', value: '$24,590', icon: BarChart3 },
            { label: 'Orders', value: orders.length, icon: ShoppingCart },
            { label: 'Products', value: products.length, icon: Package },
            { label: 'Customers', value: '1,204', icon: Users },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 shadow-sm border border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">{stat.label}</p>
                <p className="text-2xl font-medium">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-zinc-100" />
            </div>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="bg-white border border-zinc-100 shadow-sm">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'products' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-5 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'orders' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400'}`}
            >
              Recent Orders
            </button>
          </div>

          <div className="p-0 overflow-x-auto">
            {activeTab === 'products' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-[10px] uppercase tracking-widest font-bold text-zinc-400 border-b">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} className="w-10 h-12 object-cover bg-zinc-100" alt={p.name} />
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500 uppercase">{p.category}</td>
                      <td className="px-6 py-4 text-sm font-medium">${p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-[10px] uppercase tracking-widest font-bold text-zinc-400 border-b">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold font-mono">{o.id}</td>
                      <td className="px-6 py-4 text-sm">Customer #{o.userId.slice(-4)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-widest bg-zinc-100 text-zinc-600">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">${o.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
