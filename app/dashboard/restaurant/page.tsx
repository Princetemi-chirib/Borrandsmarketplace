'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Search,
  Filter,
  Bell,
  Truck,
  Package,
  Heart,
  Plus,
  ArrowRight,
  Zap,
  Award,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus as PlusIcon,
  Store
} from 'lucide-react';

interface Order {
  _id: string;
  studentName: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress: string;
  paymentStatus: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  stock: number;
  lowStockThreshold: number;
  preparationTime: number;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalMenuItems: number;
  lowStockItems: number;
  todayRevenue: number;
}

export default function RestaurantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalMenuItems: 0,
    lowStockItems: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockStats = {
    totalOrders: 156,
    pendingOrders: 8,
    completedOrders: 148,
    totalRevenue: 1250000,
    averageRating: 4.6,
    totalMenuItems: 24,
    lowStockItems: 3,
    todayRevenue: 45000
  };

  const mockOrders: Order[] = [
    {
      _id: '1',
      studentName: 'John Doe',
      status: 'pending',
      total: 8500,
      createdAt: '2024-01-15T10:30:00Z',
      estimatedDeliveryTime: '2024-01-15T11:15:00Z',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 6500 },
        { name: 'Coca Cola', quantity: 2, price: 1000 }
      ],
      deliveryAddress: 'Block A, Room 101, University Campus',
      paymentStatus: 'paid'
    },
    {
      _id: '2',
      studentName: 'Sarah Johnson',
      status: 'preparing',
      total: 3200,
      createdAt: '2024-01-15T09:15:00Z',
      estimatedDeliveryTime: '2024-01-15T10:00:00Z',
      items: [
        { name: 'Chicken Burger', quantity: 1, price: 2200 },
        { name: 'French Fries', quantity: 1, price: 1000 }
      ],
      deliveryAddress: 'Block B, Room 205, University Campus',
      paymentStatus: 'paid'
    },
    {
      _id: '3',
      studentName: 'Mike Wilson',
      status: 'ready',
      total: 12000,
      createdAt: '2024-01-15T08:45:00Z',
      estimatedDeliveryTime: '2024-01-15T09:30:00Z',
      items: [
        { name: 'Supreme Pizza', quantity: 1, price: 8000 },
        { name: 'Garlic Bread', quantity: 1, price: 2000 },
        { name: 'Sprite', quantity: 2, price: 1000 }
      ],
      deliveryAddress: 'Block C, Room 312, University Campus',
      paymentStatus: 'paid'
    }
  ];

  const mockMenuItems: MenuItem[] = [
    {
      _id: '1',
      name: 'Margherita Pizza',
      description: 'Classic tomato sauce with mozzarella cheese',
      price: 6500,
      category: 'Pizza',
      image: '/images/pizza-margherita.jpg',
      isAvailable: true,
      stock: 15,
      lowStockThreshold: 5,
      preparationTime: 20
    },
    {
      _id: '2',
      name: 'Chicken Burger',
      description: 'Grilled chicken breast with fresh vegetables',
      price: 2200,
      category: 'Burgers',
      image: '/images/chicken-burger.jpg',
      isAvailable: true,
      stock: 8,
      lowStockThreshold: 3,
      preparationTime: 15
    },
    {
      _id: '3',
      name: 'French Fries',
      description: 'Crispy golden fries with sea salt',
      price: 1000,
      category: 'Sides',
      image: '/images/french-fries.jpg',
      isAvailable: true,
      stock: 25,
      lowStockThreshold: 10,
      preparationTime: 8
    }
  ];

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setRecentOrders(mockOrders);
      setMenuItems(mockMenuItems);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'preparing':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'ready':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'picked_up':
        return 'text-indigo-600 bg-indigo-100 border-indigo-200';
      case 'in_transit':
        return 'text-cyan-600 bg-cyan-100 border-cyan-200';
      case 'delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return 'text-red-600 bg-red-100 border-red-200';
    if (stock <= threshold) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="restaurant" userName={user?.name || 'Restaurant'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user?.name || 'Restaurant';
  const displayName = userName === 'Restaurant' ? 'Restaurant' : userName;

  return (
    <DashboardLayout userRole="restaurant" userName={displayName}>
      <div className="space-y-3 sm:space-y-4">
        {/* Enhanced Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold mb-1 text-gray-900">Welcome back, {displayName}!</h1>
              <p className="text-gray-700 text-sm">Here's your restaurant overview for today</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.pendingOrders}</div>
                <div className="text-xs text-gray-600">Pending Orders</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">₦{(stats.todayRevenue / 1000).toFixed(0)}k</div>
                <div className="text-xs text-gray-600">Today's Revenue</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        >
          <Link
            href="/dashboard/restaurant/orders"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Manage Orders</h3>
                <p className="text-xs text-white/80 hidden sm:block">View & update orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/restaurant/menu"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Menu Management</h3>
                <p className="text-xs text-white/80 hidden sm:block">Update your menu</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/restaurant/inventory"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Inventory</h3>
                <p className="text-xs text-white/80 hidden sm:block">Manage stock levels</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/restaurant/analytics"
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Analytics</h3>
                <p className="text-xs text-white/80 hidden sm:block">View insights</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Cards - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        >
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.pendingOrders}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.completedOrders}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-4 sm:px-5 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                href="/dashboard/restaurant/orders"
                className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
              >
                <span className="hidden sm:inline">View All</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg border ${getStatusColor(order.status)} flex-shrink-0`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 space-y-1 sm:space-y-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {order.studentName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} self-start sm:self-auto`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-0.5 mb-2">
                          {order.items.map((item, itemIndex) => (
                            <p key={itemIndex} className="text-xs sm:text-sm text-gray-600">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{order.deliveryAddress}</span>
                            </span>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm sm:text-base font-bold text-gray-900">
                              ₦{order.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{order.paymentStatus}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="px-4 sm:px-5 py-8 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm">
                  Orders will appear here once students start placing them!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Menu Items & Low Stock Alert - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
        >
          {/* Menu Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Menu Items</h2>
                <Link 
                  href="/dashboard/restaurant/menu"
                  className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
                >
                  <span className="hidden sm:inline">Manage</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {menuItems.slice(0, 3).map((item, index) => (
                <div key={item._id} className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">₦{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStockStatus(item.stock, item.lowStockThreshold)}`}>
                        {item.stock} left
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>

            <div className="p-4">
              {stats.lowStockItems > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{stats.lowStockItems} items low on stock</p>
                        <p className="text-xs text-orange-600">Restock soon to avoid running out</p>
                      </div>
                    </div>
                    <Link 
                      href="/dashboard/restaurant/inventory"
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">All items in stock</h3>
                  <p className="text-gray-500 text-sm">Great job managing your inventory!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
