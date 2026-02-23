
import { Product, User, UserRole, Order, CartItem } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'luvia_products',
  USERS: 'luvia_users',
  ORDERS: 'luvia_orders',
  CURRENT_USER: 'luvia_active_user'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Cashmere Overshirt',
    description: 'A luxurious cashmere blend overshirt designed for the modern minimalist. Features clean lines and a relaxed fit.',
    price: 345,
    category: 'Mens',
    images: ['https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1550991152-123c9a24424b?auto=format&fit=crop&w=800&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Onyx Black', 'Navy Blue'],
    stock: 12,
    isTrending: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Silk Wrap Midi Dress',
    description: 'Handcrafted from 100% mulberry silk. This midi dress flows elegantly with every step. Perfect for gala evenings.',
    price: 520,
    category: 'Womens',
    images: ['https://images.unsplash.com/photo-1539109132304-399946ad962d?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1494578379344-d6c710382a3d?auto=format&fit=crop&w=800&q=80'],
    sizes: ['XS', 'S', 'M'],
    colors: ['Pure White', 'Sand'],
    stock: 8,
    isTrending: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Structured Wool Blazer',
    description: 'Italian virgin wool blazer with a structured silhouette. Sharp shoulders and a tailored waist.',
    price: 890,
    category: 'Womens',
    images: ['https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L'],
    colors: ['Onyx Black'],
    stock: 5,
    isTrending: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Brushed Cotton Chinos',
    description: 'Comfort meets class. Our signature chinos are garment-dyed for a unique depth of color.',
    price: 185,
    category: 'Mens',
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=800&q=80'],
    sizes: ['30', '32', '34', '36'],
    colors: ['Olive', 'Sand'],
    stock: 25,
    isTrending: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Asymmetric Silk Skirt',
    description: 'Fluid motion captured in silk. Features a bias-cut silhouette that drapes beautifully.',
    price: 295,
    category: 'Womens',
    images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M'],
    colors: ['Onyx Black', 'Sand'],
    stock: 10,
    isTrending: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Architectural Knit Sweater',
    description: 'A heavy-weight ribbed knit with unique sculptural sleeves and a mock neck.',
    price: 410,
    category: 'Womens',
    images: ['https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L'],
    colors: ['Pure White', 'Sand'],
    stock: 14,
    isTrending: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Signature Leather Boots',
    description: 'Full-grain leather boots with a modern square toe and stacked heel.',
    price: 680,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80'],
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Onyx Black'],
    stock: 6,
    isTrending: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Raw Denim Jacket',
    description: '14oz Japanese selvedge denim. Boxy fit with silver-tone hardware.',
    price: 320,
    category: 'Mens',
    images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy Blue'],
    stock: 9,
    isTrending: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Pleated Palazzo Trousers',
    description: 'High-waisted trousers with wide, flowing legs and deep pleats for maximum volume.',
    price: 375,
    category: 'Womens',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'],
    sizes: ['XS', 'S', 'M'],
    colors: ['Onyx Black', 'Sand'],
    stock: 11,
    isTrending: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Organic Cotton Ribbed Tank',
    description: 'The essential base layer. Soft, stretchy, and sustainably sourced.',
    price: 65,
    category: 'Mens',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Pure White', 'Onyx Black'],
    stock: 40,
    isTrending: true,
    createdAt: new Date().toISOString()
  }
];

export const mockApi = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  },
  getProducts: async (): Promise<Product[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  },
  getProductById: async (id: string): Promise<Product | null> => {
    const products = await mockApi.getProducts();
    return products.find(p => p.id === id) || null;
  },
  addProduct: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const products = await mockApi.getProducts();
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([...products, newProduct]));
    return newProduct;
  },
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const products = await mockApi.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    const updated = { ...products[index], ...updates };
    products[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  },
  deleteProduct: async (id: string): Promise<void> => {
    const products = await mockApi.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },
  login: async (email: string, password: string): Promise<User> => {
    const role = email.includes('admin') ? UserRole.ADMIN : UserRole.USER;
    const user: User = { id: 'user_' + Date.now(), name: email.split('@')[0], email, role };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  createOrder: async (items: CartItem[], total: number): Promise<Order> => {
    const user = mockApi.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const newOrder: Order = {
      id: 'ORD_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([...orders, newOrder]));
    return newOrder;
  },
  getOrders: async (): Promise<Order[]> => {
    const user = mockApi.getCurrentUser();
    if (!user) return [];
    const allOrders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    if (user.role === UserRole.ADMIN) return allOrders;
    return allOrders.filter(o => o.userId === user.id);
  }
};
