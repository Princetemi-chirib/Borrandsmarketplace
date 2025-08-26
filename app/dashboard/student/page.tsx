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
  Activity
} from 'lucide-react';

interface Order {
  _id: string;
  restaurantName: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  riderName?: string;
  trackingCode?: string;
}

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  favoriteRestaurants: number;
  averageRating: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  gradient: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    favoriteRestaurants: 0,
    averageRating: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockStats = {
    totalOrders: 24,
    activeOrders: 2,
    completedOrders: 22,
    totalSpent: 45600,
    favoriteRestaurants: 8,
    averageRating: 4.8
  };

  const mockOrders: Order[] = [
    {
      _id: '1',
      restaurantName: 'Pizza Palace',
      status: 'in_transit',
      total: 8500,
      createdAt: '2024-01-15T10:30:00Z',
      estimatedDeliveryTime: '2024-01-15T11:15:00Z',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 6500 },
        { name: 'Coca Cola', quantity: 2, price: 1000 }
      ],
      riderName: 'John Doe',
      trackingCode: 'TRK123456'
    },
    {
      _id: '2',
      restaurantName: 'Burger House',
      status: 'preparing',
      total: 3200,
      createdAt: '2024-01-15T09:15:00Z',
      estimatedDeliveryTime: '2024-01-15T10:00:00Z',
      items: [
        { name: 'Chicken Burger', quantity: 1, price: 2200 },
        { name: 'French Fries', quantity: 1, price: 1000 }
      ]
    },
    {
      _id: '3',
      restaurantName: 'Sushi Express',
      status: 'delivered',
      total: 12000,
      createdAt: '2024-01-14T18:00:00Z',
      estimatedDeliveryTime: '2024-01-14T18:45:00Z',
      items: [
        { name: 'California Roll', quantity: 2, price: 6000 }
      ]
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Browse Restaurants',
      description: 'Discover new places to eat',
      icon: Search,
      href: '/dashboard/student/restaurants',
      color: 'from-blue-500 to-blue-600',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Track Orders',
      description: 'Real-time order updates',
      icon: Truck,
      href: '/dashboard/student/orders',
      color: 'from-green-500 to-green-600',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Order History',
      description: 'View past orders & ratings',
      icon: Package,
      href: '/dashboard/student/history',
      color: 'from-purple-500 to-purple-600',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Favorites',
      description: 'Your saved restaurants',
      icon: Heart,
      href: '/dashboard/student/favorites',
      color: 'from-red-500 to-red-600',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600'
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

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user?.name || 'Student';
  const displayName = userName === 'Student' ? 'Student' : userName;

  return (
    <DashboardLayout userRole="student" userName={displayName}>
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
              <p className="text-gray-700 text-sm">Here's what's happening with your orders today</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.activeOrders}</div>
                <div className="text-xs text-gray-600">Active Orders</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-gray-900">₦{stats.totalSpent.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Spent</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.gradient} rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center`}
            >
              <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm">{action.title}</h3>
                  <p className="text-xs text-white/80 hidden sm:block">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Stats Cards - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
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
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.activeOrders}</p>
                <p className="text-xs text-gray-500">Active</p>
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
                <p className="text-base sm:text-lg font-bold text-gray-900">₦{(stats.totalSpent / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.favoriteRestaurants}</p>
                <p className="text-xs text-gray-500">Favorites</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders with Enhanced Design - Mobile Optimized */}
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
                href="/dashboard/student/orders"
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
                            {order.restaurantName}
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
                            {order.riderName && (
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {order.riderName}
                              </span>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm sm:text-base font-bold text-gray-900">
                              ₦{order.total.toLocaleString()}
                            </p>
                            {order.trackingCode && (
                              <p className="text-xs text-gray-500">#{order.trackingCode}</p>
                            )}
                          </div>
                        </div>

                        {order.status === 'in_transit' && (
                          <div className="mt-2 p-2 bg-cyan-50 rounded-lg border border-cyan-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <Truck className="h-3 w-3 text-cyan-600" />
                                <span className="text-xs sm:text-sm font-medium text-cyan-800">Out for delivery</span>
                              </div>
                              <span className="text-xs sm:text-sm text-cyan-600">
                                Est. {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        )}
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
                  Start exploring restaurants and place your first order to see it here!
                </p>
                <Link 
                  href="/dashboard/student/restaurants"
                  className="btn-primary inline-flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Restaurants
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Special Offers & Promotions - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
        

      
        </motion.div>
      </div>
    </DashboardLayout>
  );
}





