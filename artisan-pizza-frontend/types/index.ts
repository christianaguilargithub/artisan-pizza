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
  low_stock_threshold: number;
  is_low_stock?: boolean;
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

export interface Discount {
  id: number;
  name: string;
  promo_code: string;
  type: 'fixed' | 'percent';
  value: number;
  usage_limit?: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at?: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  user_id: number;
  discount_id?: number | null;
  shift_id?: number | null;
  queue_number: number;
  order_source: OrderSource;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  notes?: string | null;
  called_at?: string;
  refunded_at?: string | null;
  user?: User;
  discount?: Discount | null;
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

export interface Shift {
  id: number;
  user_id: number;
  opening_cash: number;
  closing_cash?: number | null;
  expected_cash?: number | null;
  total_sales: number;
  total_orders: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string | null;
  notes?: string | null;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface ReceiptData {
  receipt_number: string;
  date: string;
  cashier: string;
  queue_number: number;
  order_source: string;
  items: { name: string; quantity: number; unit_price: number; subtotal: number }[];
  subtotal: number;
  discount_code?: string | null;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  amount_tendered: number;
  change_given: number;
  qr_reference?: string | null;
}

export interface DailyReport {
  date: string;
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  by_payment_method: Record<string, { count: number; amount: number }>;
  top_products: { product_id: number; product_name: string; quantity: number; revenue: number }[];
  status_breakdown: Record<string, number>;
  low_stock_items: InventoryItem[];
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
  discount_code?: string;
  notes?: string;
  tax_rate?: number;
}

export interface CreatePaymentPayload {
  order_id: number;
  payment_method: PaymentMethod;
  amount_tendered: number;
  qr_reference?: string;
}
