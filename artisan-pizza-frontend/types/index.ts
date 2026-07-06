export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  role?: Role;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  author: string;
  products_count?: number;
  products?: Product[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  author: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInventoryPivot {
  qty_used: number;
  author: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  price: number;
  image_path?: string | null;
  image_url?: string | null;
  author: number;
  category?: Category;
  inventory_items?: (InventoryItem & { pivot: ProductInventoryPivot })[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderSource = 'dine-in' | 'online' | 'walk-in';

export interface Order {
  id: number;
  user_id: number;
  queue_number: number;
  order_source: OrderSource;
  status: OrderStatus;
  total_amount: number;
  called_at?: string;
  user?: User;
  order_items?: OrderItem[];
  payment?: Payment;
  created_at?: string;
  updated_at?: string;
}

export type PaymentMethod = 'cash' | 'qr' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Payment {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  amount_tendered: number;
  change_given: number;
  qr_reference?: string;
  status: PaymentStatus;
  order?: Order;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateOrderPayload {
  order_source: OrderSource;
  items: { product_id: number; quantity: number }[];
}

export interface CreatePaymentPayload {
  order_id: number;
  payment_method: PaymentMethod;
  amount_tendered: number;
  qr_reference?: string;
}
