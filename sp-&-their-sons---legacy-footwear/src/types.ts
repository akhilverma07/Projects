export type MainCategory = 'Footwear' | 'Clothing';
export type Gender = 'Men' | 'Women' | 'Kids';
export type ProductType = 
  | 'Shoes' | 'Sandals' | 'Slippers' | 'Wedding' | 'Casual' | 'Sports'
  | 'T-Shirts' | 'Shirts' | 'Jeans' | 'Cargo Pants' | 'Shorts' | 'Track Pants' 
  | 'Sarees' | 'Kurtis' | 'Tops' | 'Dresses' | 'School wear';

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  mainCategory: MainCategory;
  category: ProductType;
  gender: Gender;
  images: string[];
  description: string;
  sizes: (number | string)[];
  isTrending?: boolean;
  isFeatured?: boolean;
  discount: number;
}

export interface CartItem extends Product {
  selectedSize: number | string;
  quantity: number;
}

export interface WishlistItem extends Product {}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Card' | 'Cash on Delivery';
export type PaymentStatus = 'Paid' | 'Pending' | 'Cash on Delivery';

export interface OrderItem extends CartItem {}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderForSomeoneElse: boolean;
  recipientName?: string;
  recipientPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  isNew?: boolean;
  createdAt: string;
  deliveredAt?: string;
  adminViewedAt?: string;
  statusUpdatedAt?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
  note?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}
