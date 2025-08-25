export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  university: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'student' | 'restaurant' | 'rider' | 'admin';

export interface Restaurant {
  _id: string;
  userId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  university: string;
  cuisine: string[];
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  image: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  stock: number;
  lowStockThreshold: number;
  preparationTime: number;
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  studentId: string;
  restaurantId: string;
  riderId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'cash';

export interface Rider {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  university: string;
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface University {
  _id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export type NotificationType = 
  | 'order_status'
  | 'payment'
  | 'delivery'
  | 'inventory'
  | 'system';

export interface WhatsAppMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string;
}

export interface PaystackTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  gateway_response: string;
  paid_at: string;
  channel: string;
  ip_address: string;
  metadata: {
    orderId: string;
    userId: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isAvailable?: boolean;
  cuisine?: string[];
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}



