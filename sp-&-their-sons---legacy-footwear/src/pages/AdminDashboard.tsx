import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BellRing,
  CalendarRange,
  Edit3,
  IndianRupee,
  PackageCheck,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { clothingCategories, footwearCategories } from '../data/products';
import { ADMIN_EMAIL, useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import { Expense, Gender, MainCategory, OrderStatus, PaymentStatus, Product, ProductType } from '../types';

type ProductFormState = {
  id: string;
  name: string;
  price: string;
  costPrice: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  mainCategory: MainCategory;
  category: ProductType;
  gender: Gender;
  images: [string, string, string];
  description: string;
  sizes: string;
  discount: string;
  isTrending: boolean;
  isFeatured: boolean;
};

type ExpenseFormState = {
  title: string;
  amount: string;
  category: string;
  note: string;
};

const orderStatuses: OrderStatus[] = ['Placed', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

const createEmptyProductForm = (): ProductFormState => ({
  id: '',
  name: '',
  price: '999',
  costPrice: '600',
  originalPrice: '999',
  rating: '4.5',
  reviews: '0',
  mainCategory: 'Footwear',
  category: 'Shoes',
  gender: 'Men',
  images: ['', '', ''],
  description: '',
  sizes: '7,8,9,10',
  discount: '0',
  isTrending: false,
  isFeatured: false,
});

const createEmptyExpenseForm = (): ExpenseFormState => ({
  title: '',
  amount: '',
  category: 'Inventory',
  note: '',
});

const getCategoryOptions = (mainCategory: MainCategory) => (
  mainCategory === 'Footwear' ? footwearCategories : clothingCategories
);

const toFormState = (product: Product): ProductFormState => ({
  id: product.id,
  name: product.name,
  price: String(product.price),
  costPrice: String(product.costPrice ?? Math.max(1, Math.round(product.price * 0.65))),
  originalPrice: String(product.originalPrice),
  rating: String(Number(product.rating.toFixed(1))),
  reviews: String(product.reviews),
  mainCategory: product.mainCategory,
  category: product.category,
  gender: product.gender,
  images: [
    product.images[0] || '',
    product.images[1] || '',
    product.images[2] || '',
  ],
  description: product.description,
  sizes: product.sizes.join(','),
  discount: String(product.discount),
  isTrending: Boolean(product.isTrending),
  isFeatured: Boolean(product.isFeatured),
});

const buildProductFromForm = (form: ProductFormState, fallbackId: string): Product => {
  const sizes = form.sizes
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => {
      const asNumber = Number(size);
      return Number.isNaN(asNumber) ? size : asNumber;
    });

  const images = form.images.map((image) => image.trim()).filter(Boolean);

  return {
    id: form.id.trim() || fallbackId,
    name: form.name.trim(),
    price: Number(form.price),
    costPrice: Number(form.costPrice),
    originalPrice: Number(form.originalPrice),
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    mainCategory: form.mainCategory,
    category: form.category,
    gender: form.gender,
    images: images.length > 0 ? images : ['https://picsum.photos/seed/fallback-footwear/800/800'],
    description: form.description.trim(),
    sizes,
    discount: Number(form.discount),
    isTrending: form.isTrending,
    isFeatured: form.isFeatured,
  };
};

const getCutoffDate = (range: 'today' | '1m' | '2m' | '1y') => {
  const now = new Date();

  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (range === '1m') {
    return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }

  if (range === '2m') {
    return new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
  }

  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const getSalesDate = (dateValue?: string) => dateValue ? new Date(dateValue) : null;

const formatDateTime = (value?: string) => value
  ? new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  : null;

const paymentStatusClasses: Record<PaymentStatus, string> = {
  Paid: 'bg-green-500/10 text-green-300',
  Pending: 'bg-amber-500/10 text-amber-200',
  'Cash on Delivery': 'bg-blue-500/10 text-blue-200',
};

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { orders, expenses, contactMessages, newsletterSubscribers, updateOrderStatus, markOrderAsRead, addExpense, removeExpense } = useOrders();

  const [search, setSearch] = useState('');
  const [activeMainCategory, setActiveMainCategory] = useState<'All' | MainCategory>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(createEmptyProductForm());
  const [message, setMessage] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [salesRange, setSalesRange] = useState<'today' | '1m' | '2m' | '1y'>('1m');
  const [expenseRange, setExpenseRange] = useState<'1m' | '2m' | '1y'>('1m');
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(createEmptyExpenseForm());
  const [expenseMessage, setExpenseMessage] = useState('');
  const [orderActionMessage, setOrderActionMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => (
    products.filter((product) => {
      const searchText = `${product.name} ${product.category} ${product.gender}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesCategory = activeMainCategory === 'All' || product.mainCategory === activeMainCategory;
      return matchesSearch && matchesCategory;
    })
  ), [activeMainCategory, products, search]);

  const inventoryStats = useMemo(() => ({
    total: products.length,
    footwear: products.filter((product) => product.mainCategory === 'Footwear').length,
    clothing: products.filter((product) => product.mainCategory === 'Clothing').length,
    avgPrice: products.length ? Math.round(products.reduce((total, product) => total + product.price, 0) / products.length) : 0,
  }), [products]);

  const filteredOrders = useMemo(() => (
    orders.filter((order) => {
      const searchText = `${order.id} ${order.customerName} ${order.customerEmail} ${order.customerPhone} ${order.deliveryAddress} ${order.pincode} ${order.status} ${order.paymentMethod} ${order.paymentStatus} ${order.recipientName || ''} ${order.recipientPhone || ''}`.toLowerCase();
      return searchText.includes(orderSearch.toLowerCase());
    })
  ), [orderSearch, orders]);

  const deliveredOrders = useMemo(() => (
    orders.filter((order) => order.status === 'Delivered' && order.deliveredAt)
  ), [orders]);

  const newOrdersCount = useMemo(() => (
    orders.filter((order) => order.isNew).length
  ), [orders]);

  const salesOrders = useMemo(() => {
    const cutoff = getCutoffDate(salesRange);
    return deliveredOrders.filter((order) => {
      const salesDate = getSalesDate(order.deliveredAt);
      return salesDate ? salesDate >= cutoff : false;
    });
  }, [deliveredOrders, salesRange]);

  const expenseEntries = useMemo(() => {
    const cutoff = getCutoffDate(expenseRange);
    return expenses.filter((expense) => new Date(expense.createdAt) >= cutoff);
  }, [expenseRange, expenses]);

  const salesStats = useMemo(() => {
    const todayCutoff = getCutoffDate('today');
    const monthCutoff = getCutoffDate('1m');
    const yearCutoff = getCutoffDate('1y');

    const todayOrders = deliveredOrders.filter((order) => {
      const salesDate = getSalesDate(order.deliveredAt);
      return salesDate ? salesDate >= todayCutoff : false;
    });
    const monthOrders = deliveredOrders.filter((order) => {
      const salesDate = getSalesDate(order.deliveredAt);
      return salesDate ? salesDate >= monthCutoff : false;
    });
    const yearOrders = deliveredOrders.filter((order) => {
      const salesDate = getSalesDate(order.deliveredAt);
      return salesDate ? salesDate >= yearCutoff : false;
    });
    const rangeRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0);
    const deliveredCount = deliveredOrders.length;

    return {
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
      monthRevenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
      yearRevenue: yearOrders.reduce((sum, order) => sum + order.total, 0),
      rangeRevenue,
      deliveredCount,
    };
  }, [deliveredOrders, salesOrders]);

  const expenseStats = useMemo(() => {
    const totalExpense = expenseEntries.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyExpense = expenses
      .filter((expense) => new Date(expense.createdAt) >= getCutoffDate('1m'))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalExpense,
      monthlyExpense,
      netSales: salesStats.rangeRevenue - totalExpense,
    };
  }, [expenseEntries, expenses, salesStats.rangeRevenue]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const updateForm = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateImage = (index: 0 | 1 | 2, value: string) => {
    setForm((current) => {
      const nextImages: [string, string, string] = [...current.images] as [string, string, string];
      nextImages[index] = value;
      return { ...current, images: nextImages };
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyProductForm());
  };

  const handleCategoryChange = (nextMainCategory: MainCategory) => {
    updateForm('mainCategory', nextMainCategory);
    updateForm('category', getCategoryOptions(nextMainCategory)[0]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (!form.name.trim() || !form.description.trim()) {
      setMessage('Please fill in the product name and description.');
      return;
    }

    const fallbackId = editingId ?? `product-${Date.now()}`;
    const nextProduct = buildProductFromForm(form, fallbackId);

    if (!nextProduct.sizes.length) {
      setMessage('Please add at least one size.');
      return;
    }

    if (editingId) {
      updateProduct(editingId, nextProduct);
      setMessage('Product updated successfully.');
    } else {
      addProduct(nextProduct);
      setMessage('Product added successfully.');
    }

    resetForm();
  };

  const handleExpenseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExpenseMessage('');

    if (!expenseForm.title.trim() || !expenseForm.amount) {
      setExpenseMessage('Please fill in the expense title and amount.');
      return;
    }

    addExpense({
      title: expenseForm.title.trim(),
      amount: Number(expenseForm.amount),
      category: expenseForm.category.trim(),
      note: expenseForm.note.trim(),
    });

    setExpenseForm(createEmptyExpenseForm());
    setExpenseMessage('Expense added successfully.');
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setOrderActionMessage('');
    setUpdatingOrderId(orderId);

    try {
      await updateOrderStatus(orderId, status);
      setOrderActionMessage(`Order status updated to ${status}.`);
    } catch (error) {
      setOrderActionMessage(error instanceof Error ? error.message : 'Unable to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkAsRead = async (orderId: string) => {
    setOrderActionMessage('');
    setUpdatingOrderId(orderId);

    try {
      await markOrderAsRead(orderId);
      setOrderActionMessage('Order marked as read.');
    } catch (error) {
      setOrderActionMessage(error instanceof Error ? error.message : 'Unable to mark order as read.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="border-b border-white/10 bg-brand-gray/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3">
              <span className="text-brand-red text-xs font-black uppercase tracking-[0.35em]">Admin Control</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter">BUSINESS DASHBOARD</h1>
              <p className="text-white/50 max-w-3xl">
                Manage products, review all placed orders, change order status, watch sales, track expenses, and read customer messages plus newsletter emails from one admin panel.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-red/20 bg-brand-red/10 px-6 py-5 text-sm text-white/70">
              <p className="font-black uppercase tracking-widest text-brand-red mb-1">Signed in as admin</p>
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p className="text-[11px] text-white/40 mt-2">Admin access email: {ADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Today Sell</p>
              <p className="text-3xl font-black mt-3">₹{salesStats.todayRevenue}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">1 Month Sell</p>
              <p className="text-3xl font-black mt-3">₹{salesStats.monthRevenue}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">1 Year Sell</p>
              <p className="text-3xl font-black mt-3">₹{salesStats.yearRevenue}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Delivered Orders</p>
              <p className="text-3xl font-black mt-3">{salesStats.deliveredCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <section className="sticky top-20 z-20 rounded-[2rem] border border-white/10 bg-brand-gray/90 backdrop-blur-xl p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'products-section', label: 'Products' },
              { id: 'orders-section', label: `Orders${newOrdersCount ? ` (${newOrdersCount} New)` : ''}` },
              { id: 'sales-section', label: 'Sales' },
              { id: 'expenses-section', label: 'Expenses' },
              { id: 'messages-section', label: 'Messages' },
            ].map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full bg-brand-dark px-5 py-3 text-xs font-black uppercase tracking-widest text-white/70 transition-colors hover:bg-brand-red hover:text-white"
              >
                {section.label}
              </a>
            ))}
          </div>
        </section>

        <section id="products-section" className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-8 scroll-mt-32">
          <div className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">
                  {editingId ? 'Edit Item' : 'Add Item'}
                </p>
                <h2 className="text-2xl font-black tracking-tight mt-2">
                  {editingId ? 'Update Product Details' : 'Create New Product'}
                </h2>
              </div>
              {editingId && (
                <button onClick={resetForm} className="p-2 rounded-full border border-white/10 hover:border-brand-red transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Product Name</label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Premium leather shoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Section</label>
                  <select
                    value={form.mainCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as MainCategory)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Clothing">Clothing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateForm('gender', e.target.value as Gender)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value as ProductType)}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                >
                  {getCategoryOptions(form.mainCategory).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Cost Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.costPrice}
                    onChange={(e) => updateForm('costPrice', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Original</label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => updateForm('originalPrice', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    value={form.discount}
                    onChange={(e) => updateForm('discount', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => updateForm('rating', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Reviews</label>
                  <input
                    type="number"
                    min="0"
                    value={form.reviews}
                    onChange={(e) => updateForm('reviews', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Sizes</label>
                <input
                  value={form.sizes}
                  onChange={(e) => updateForm('sizes', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="7,8,9,10 or S,M,L,XL"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-widest text-white/40">Images</label>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    value={form.images[index as 0 | 1 | 2]}
                    onChange={(e) => updateImage(index as 0 | 1 | 2, e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                    placeholder={`Image URL ${index + 1}`}
                  />
                ))}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Write a clear product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isTrending}
                    onChange={(e) => updateForm('isTrending', e.target.checked)}
                  />
                  Trending
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateForm('isFeatured', e.target.checked)}
                  />
                  Featured
                </label>
              </div>

              {message && <p className="text-sm text-brand-red">{message}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-brand-red px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Item Library</p>
                <h2 className="text-2xl font-black tracking-tight mt-2">Search and manage product details</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, category, gender"
                    className="rounded-full border border-white/10 bg-brand-dark pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red w-full sm:w-80"
                  />
                </div>
                <select
                  value={activeMainCategory}
                  onChange={(e) => setActiveMainCategory(e.target.value as 'All' | MainCategory)}
                  className="rounded-full border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                >
                  <option value="All">All Sections</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Clothing">Clothing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Total Items</p>
                <p className="text-3xl font-black mt-3">{inventoryStats.total}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Footwear</p>
                <p className="text-3xl font-black mt-3">{inventoryStats.footwear}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Clothing</p>
                <p className="text-3xl font-black mt-3">{inventoryStats.clothing}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Average Price</p>
                <p className="text-3xl font-black mt-3">₹{inventoryStats.avgPrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 p-4 sm:p-5">
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-center justify-between">
                    <div className="flex gap-4 min-w-0">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-24 h-24 rounded-2xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-brand-red/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-red">
                            {product.mainCategory}
                          </span>
                          <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                            {product.gender}
                          </span>
                          {product.isFeatured && <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-black">Featured</span>}
                          {product.isTrending && <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">Trending</span>}
                        </div>
                        <h3 className="text-lg font-black truncate">{product.name}</h3>
                        <p className="text-sm text-white/50 line-clamp-2">{product.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-white/40 uppercase tracking-widest">
                          <span>ID: {product.id}</span>
                          <span>{product.category}</span>
                          <span>Sizes: {product.sizes.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center xl:justify-end">
                      <div className="min-w-[150px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Price / Cost</p>
                        <p className="text-xl font-black mt-2">₹{product.price}</p>
                        <p className="text-xs text-white/30">Cost ₹{product.costPrice ?? 0}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setForm(toFormState(product));
                            setMessage('');
                          }}
                          className="rounded-full border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest hover:border-brand-red hover:text-brand-red transition-colors flex items-center gap-2"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="rounded-full border border-red-500/20 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                  <Shield size={32} className="mx-auto text-white/20 mb-4" />
                  <p className="text-lg font-black">No products found</p>
                  <p className="text-sm text-white/40 mt-2">Try another search term or add a new item from the form.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="orders-section" className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8 scroll-mt-32">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Order Management</p>
              <h2 className="text-2xl font-black tracking-tight mt-2">Review full order details and change status from placed to delivered or cancelled</h2>
              <p className="text-sm text-white/50 mt-3">New orders waiting for review: <span className="text-white font-black">{newOrdersCount}</span></p>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order id, customer, email"
                className="rounded-full border border-white/10 bg-brand-dark pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red w-full sm:w-80"
              />
            </div>
          </div>

          {orderActionMessage && (
            <div className="mb-6 rounded-2xl border border-brand-red/20 bg-brand-dark px-4 py-3 text-sm text-white/70">
              {orderActionMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="rounded-3xl border border-brand-red/20 bg-brand-red/10 px-6 py-5">
              <div className="flex items-center gap-3 text-brand-red">
                <BellRing size={18} />
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">New Orders</p>
              </div>
              <p className="text-3xl font-black mt-3">{newOrdersCount}</p>
            </div>
            {orderStatuses.map((status) => (
              <div key={status} className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">{status}</p>
                <p className="text-3xl font-black mt-3">{orders.filter((order) => order.status === status).length}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 p-5">
                {(() => {
                  const paymentMethod = order.paymentMethod || 'Cash on Delivery';
                  const paymentStatus = order.paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Paid');
                  const lastViewedLabel = formatDateTime(order.adminViewedAt);
                  const lastStatusLabel = formatDateTime(order.statusUpdatedAt);

                  return (
                <div className="flex flex-col xl:flex-row gap-5 xl:items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="rounded-full bg-brand-red/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-red">
                        {order.id}
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                        Placed: {formatDate(order.createdAt)}
                      </span>
                      {order.deliveredAt && (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-green-300">
                          Delivered: {formatDate(order.deliveredAt)}
                        </span>
                      )}
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">
                        Payment Type: {paymentMethod}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] ${paymentStatusClasses[paymentStatus] ?? 'bg-white/10 text-white/70'}`}>
                        Payment Status: {paymentStatus}
                      </span>
                      {order.isNew && (
                        <span className="rounded-full bg-brand-red px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                          New Order
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{order.customerName}</h3>
                      <p className="text-sm text-white/50">{order.customerEmail}</p>
                      <p className="text-sm text-white/50">{order.customerPhone}</p>
                      <p className="text-sm text-white/50">{order.deliveryAddress}</p>
                      <p className="text-sm text-white/50">Pincode: {order.pincode}</p>
                      <p className="text-sm text-white/50">Current Status: <span className="text-white font-bold">{order.status}</span></p>
                      <p className="text-sm text-white/50">Payment Type: <span className="text-white font-bold">{paymentMethod}</span></p>
                      <p className="text-sm text-white/50">Payment Status: <span className="text-white font-bold">{paymentStatus}</span></p>
                      {lastStatusLabel && <p className="text-sm text-white/40">Last status update: {lastStatusLabel}</p>}
                      {lastViewedLabel && <p className="text-sm text-white/40">Last viewed by admin: {lastViewedLabel}</p>}
                      {order.orderForSomeoneElse && (
                        <p className="text-sm text-brand-red">
                          Receiver: {order.recipientName} ({order.recipientPhone})
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-white/60 space-y-1">
                      {order.items.map((item) => (
                        <p key={`${order.id}-${item.id}-${item.selectedSize}`}>
                          {item.name} x {item.quantity} ({item.selectedSize})
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 min-w-[150px]">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Order Total</p>
                      <p className="text-2xl font-black mt-2">₹{order.total}</p>
                      <p className="text-xs text-white/30">Items: {order.items.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 min-w-[180px]">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Payment</p>
                      <p className="text-base font-black mt-2">{paymentMethod}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 mt-3 text-[10px] font-black uppercase tracking-[0.25em] ${paymentStatusClasses[paymentStatus] ?? 'bg-white/10 text-white/70'}`}>
                        {paymentStatus}
                      </span>
                    </div>
                    {order.isNew && (
                      <button
                        type="button"
                        onClick={() => void handleMarkAsRead(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="rounded-full border border-brand-red/30 px-4 py-3 text-xs font-black uppercase tracking-widest text-brand-red hover:bg-brand-red hover:text-white transition-colors disabled:opacity-60"
                      >
                        {updatingOrderId === order.id ? 'Please wait...' : 'Mark Read'}
                      </button>
                    )}
                    <select
                      value={order.status}
                      onChange={(e) => void handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingOrderId === order.id}
                      className="rounded-full border border-white/10 bg-brand-dark px-4 py-3 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-brand-red"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                  );
                })()}
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                <PackageCheck size={32} className="mx-auto text-white/20 mb-4" />
                <p className="text-lg font-black">No orders yet</p>
                <p className="text-sm text-white/40 mt-2">Placed orders will appear here once customers checkout.</p>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-8">
          <div id="sales-section" className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8 scroll-mt-32">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Sales Summary</p>
                <h2 className="text-2xl font-black tracking-tight mt-2">Today, monthly, and yearly revenue overview</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'today', label: 'Today' },
                  { id: '1m', label: '1 Month' },
                  { id: '2m', label: '2 Months' },
                  { id: '1y', label: '1 Year' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setSalesRange(range.id as 'today' | '1m' | '2m' | '1y')}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                      salesRange === range.id ? 'bg-brand-red text-white' : 'bg-brand-dark text-white/60 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <div className="flex items-center gap-2 text-brand-red">
                  <IndianRupee size={18} />
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Range Sales</p>
                </div>
                <p className="text-3xl font-black mt-3">₹{salesStats.rangeRevenue}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <div className="flex items-center gap-2 text-brand-red">
                  <ShoppingBag size={18} />
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Orders in Range</p>
                </div>
                <p className="text-3xl font-black mt-3">{salesOrders.length}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <div className="flex items-center gap-2 text-brand-red">
                  <Truck size={18} />
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Net After Expense</p>
                </div>
                <p className="text-3xl font-black mt-3">₹{expenseStats.netSales}</p>
              </div>
            </div>

            <div className="space-y-4">
              {salesOrders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">{order.customerName}</p>
                    <p className="text-xs text-white/40">
                      {order.id} • {order.deliveredAt ? `Delivered ${formatDate(order.deliveredAt)}` : `Placed ${formatDate(order.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="rounded-full bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-white/60">{order.status}</span>
                    <span className="text-lg font-black">₹{order.total}</span>
                  </div>
                </div>
              ))}

              {salesOrders.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                  <CalendarRange size={32} className="mx-auto text-white/20 mb-4" />
                  <p className="text-lg font-black">No sales in this range</p>
                </div>
              )}
            </div>
          </div>

          <div id="expenses-section" className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8 scroll-mt-32">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Shopping Price Tracker</p>
                <h2 className="text-2xl font-black tracking-tight mt-2">Track monthly and yearly expenses</h2>
              </div>
              <div className="flex gap-2">
                {[
                  { id: '1m', label: '1 Month' },
                  { id: '2m', label: '2 Months' },
                  { id: '1y', label: '1 Year' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setExpenseRange(range.id as '1m' | '2m' | '1y')}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                      expenseRange === range.id ? 'bg-brand-red text-white' : 'bg-brand-dark text-white/60 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">Range Expense</p>
                <p className="text-3xl font-black mt-3">₹{expenseStats.totalExpense}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-brand-dark px-6 py-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">1 Month Expense</p>
                <p className="text-3xl font-black mt-3">₹{expenseStats.monthlyExpense}</p>
              </div>
            </div>

            <form className="space-y-4 mb-8" onSubmit={handleExpenseSubmit}>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2">Expense Title</label>
                <input
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm((current) => ({ ...current, title: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Factory material purchase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((current) => ({ ...current, amount: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Amount"
                />
                <input
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((current) => ({ ...current, category: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Category"
                />
              </div>
              <textarea
                value={expenseForm.note}
                onChange={(e) => setExpenseForm((current) => ({ ...current, note: e.target.value }))}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-brand-dark px-4 py-3 text-sm focus:outline-none focus:border-brand-red"
                placeholder="Optional note"
              />
              {expenseMessage && <p className="text-sm text-brand-red">{expenseMessage}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-brand-red px-6 py-4 text-sm font-black uppercase tracking-widest text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Expense
              </button>
            </form>

            <div className="space-y-4">
              {expenseEntries.map((expense: Expense) => (
                <div key={expense.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 px-5 py-4">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    <div>
                      <p className="text-sm font-black">{expense.title}</p>
                      <p className="text-xs text-white/40">{expense.category} • {formatDate(expense.createdAt)}</p>
                      {expense.note && <p className="text-sm text-white/50 mt-2">{expense.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black">₹{expense.amount}</span>
                      <button
                        onClick={() => removeExpense(expense.id)}
                        className="rounded-full border border-red-500/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {expenseEntries.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                  <IndianRupee size={32} className="mx-auto text-white/20 mb-4" />
                  <p className="text-lg font-black">No expense records in this range</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="messages-section" className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8 scroll-mt-32">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Contact Messages</p>
              <h2 className="text-2xl font-black tracking-tight mt-2">All customer issues, suggestions, and support details</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full bg-brand-dark px-5 py-3 text-sm text-white/60 border border-white/10">
                Total messages: <span className="text-white font-black">{contactMessages.length}</span>
              </div>
              <div className="rounded-full bg-brand-dark px-5 py-3 text-sm text-white/60 border border-white/10">
                Newsletter emails: <span className="text-white font-black">{newsletterSubscribers.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-8">
            <div className="space-y-4">
              {contactMessages.map((message) => (
                <div key={message.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 p-5">
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="rounded-full bg-brand-red/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-red">
                          {message.subject}
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black">{message.name}</h3>
                        <p className="text-sm text-white/50">{message.email}</p>
                        <p className="text-sm text-white/50">{message.mobile}</p>
                        <p className="text-sm text-white/50">Subject: {message.subject}</p>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {contactMessages.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                  <Shield size={32} className="mx-auto text-white/20 mb-4" />
                  <p className="text-lg font-black">No contact messages yet</p>
                  <p className="text-sm text-white/40 mt-2">Messages from the contact page will appear here with name, email, mobile, and issue details.</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-brand-dark/60 p-6 h-fit">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Newsletter Emails</p>
                <h3 className="text-xl font-black tracking-tight mt-2">Footer newsletter subscribers</h3>
              </div>

              <div className="space-y-3">
                {newsletterSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                    <p className="text-sm font-black break-all">{subscriber.email}</p>
                    <p className="text-xs text-white/40 mt-1">{formatDate(subscriber.createdAt)}</p>
                  </div>
                ))}

                {newsletterSubscribers.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
                    <p className="text-sm font-black">No newsletter emails yet</p>
                    <p className="text-xs text-white/40 mt-2">Footer newsletter subscriptions will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
