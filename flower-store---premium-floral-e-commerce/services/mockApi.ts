
import { Product, User, UserRole, Order, CartItem } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'flowerstore_products',
  USERS: 'flowerstore_users',
  ORDERS: 'flowerstore_orders',
  CURRENT_USER: 'flowerstore_active_user'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'f1',
    name: 'Elegant Pink Rose Bouquet',
    description: 'A stunning arrangement of premium pink roses, hand-picked for their vibrant color and long-lasting freshness.',
    price: 45,
    category: 'Bouquets',
    images: ['https://images.pexels.com/photos/1328764/pexels-photo-1328764.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small', 'Medium', 'Large'],
    colors: ['Rose Pink'],
    stock: 50,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'f2',
    name: 'White Tulip Collection',
    description: 'Minimalist and sophisticated white tulips presented in a modern glass vase. Perfect for housewarming gifts.',
    price: 32,
    category: 'Flowers',
    images: ['https://images.pexels.com/photos/20594507/pexels-photo-20594507/free-photo-of-white-tulips-in-vase.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Medium'],
    colors: ['White Lily'],
    stock: 30,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  },
  {
    id: 'f3',
    name: 'Vibrant Mixed Tulip Pot',
    description: 'A cheerful mix of colorful tulips planted in an artisan ceramic pot. Brings life to any room.',
    price: 55,
    category: 'Pots',
    images: ['https://images.pexels.com/photos/29558368/pexels-photo-29558368/free-photo-of-close-up-of-fresh-tulip-bouquet-on-table.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Medium', 'Large'],
    colors: ['Tulip Red', 'Sunflower Yellow'],
    stock: 15,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() // 3 days ago
  },
  {
    id: 'f4',
    name: 'Cozy Tulip Arrangement',
    description: 'Soft-toned tulips arranged to create a warm and cozy atmosphere in your home.',
    price: 38,
    category: 'Bouquets',
    images: ['https://images.pexels.com/photos/30060214/pexels-photo-30060214/free-photo-of-cozy-tulip-arrangement-with-candlelit-ambiance.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small', 'Medium'],
    colors: ['Rose Pink', 'Lilac'],
    stock: 20,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'f5',
    name: 'Sun-Kissed Petals',
    description: 'Bright and energetic flowers that capture the essence of a summer morning.',
    price: 28,
    category: 'Flowers',
    images: ['https://images.pexels.com/photos/1903965/pexels-photo-1903965.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small'],
    colors: ['Sunflower Yellow'],
    stock: 45,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
  },
  {
    id: 'f6',
    name: 'Ceramic Succulent Trio',
    description: 'A set of three low-maintenance succulents in decorative ceramic pots.',
    price: 65,
    category: 'Pots',
    images: ['https://images.pexels.com/photos/4065170/pexels-photo-4065170.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small'],
    colors: ['Sand'],
    stock: 10,
    isTrending: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    id: 'f7',
    name: 'Wildflower Meadow Mix',
    description: 'A rustic and charming mix of wildflowers that look like they were just gathered from a summer meadow.',
    price: 42,
    category: 'Bouquets',
    images: ['https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Medium', 'Large'],
    colors: ['Lilac', 'Sunflower Yellow'],
    stock: 25,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: 'f8',
    name: 'Midnight Orchid Bloom',
    description: 'An exotic and mysterious midnight orchid, symbolizing strength and luxury.',
    price: 85,
    category: 'Flowers',
    images: ['https://images.pexels.com/photos/2085527/pexels-photo-2085527.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small', 'Medium'],
    colors: ['Lilac', 'Onyx Black'],
    stock: 12,
    isTrending: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 mins ago
  },
  {
    id: 'f9',
    name: 'Sunflower Joy',
    description: 'Radiant and bright sunflowers that bring the warmth of the sun into any room.',
    price: 24,
    category: 'Flowers',
    images: ['https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Medium'],
    colors: ['Sunflower Yellow'],
    stock: 40,
    isTrending: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'f10',
    name: 'Lavender Field Bundle',
    description: 'A calming and aromatic bundle of fresh lavender, perfect for relaxation and décor.',
    price: 19,
    category: 'Bouquets',
    images: ['https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=800'],
    sizes: ['Small'],
    colors: ['Lilac'],
    stock: 100,
    isTrending: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // 1 week ago
  }
];

export const mockApi = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    } else {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
        if (existing.length < INITIAL_PRODUCTS.length) {
             localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        }
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
    const newProduct = { ...product, id: 'f_' + Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
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
