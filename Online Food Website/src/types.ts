export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  adminScope?: 'all' | 'own';
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  created_by?: string;
  created_by_name?: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}
