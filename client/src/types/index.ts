// TypeScript interfaces for the Restaurant POS application

export interface User {
  id: string;
  name: string;
  email?: string;
  workerId?: string;
  role: 'owner' | 'worker';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  workerId: {
    _id: string;
    name: string;
    email?: string;
  };
  items: OrderItem[];
  extraCharge?: number;
  extraChargeLabel?: string;
  total: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  cashTotal: number;
  upiTotal: number;
  cardTotal: number;
  cashOrders: number;
  upiOrders: number;
  cardOrders: number;
}

export interface DailyChartData {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface PaymentChartData {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface DailyReport {
  date: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    cashTotal: number;
    upiTotal: number;
    cardTotal: number;
  };
  orders: Order[];
}

export interface MonthlyReport {
  month: number;
  year: number;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    cashTotal: number;
    upiTotal: number;
    cardTotal: number;
  };
  dailyStats: {
    _id: string;
    revenue: number;
    orders: number;
    cash: number;
    upi: number;
    card: number;
  }[];
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export type PaymentMethod = 'cash' | 'upi' | 'card';
export type ProductCategory = 'Snacks' | 'Beverages' | 'Sweets' | 'Main Course' | 'Breads' | 'Desserts' | 'Other';

export interface RawMaterial {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  sellerName: string;
  price: number;
  minStockLevel: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
