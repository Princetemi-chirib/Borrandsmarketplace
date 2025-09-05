'use client';
// Updated: Removed mock data, now fetches real data from /api/students/orders and /api/students/favorites

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  MapPin,
  ArrowRight,
  Calendar,
  Clock3,
  MessageCircle
} from 'lucide-react';

interface Order {
  _id: string;
  restaurantName: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  riderName?: string;
  trackingCode?: string;
}

interface Restaurant {
  _id: string;
  name: string;
  rating: number;
}

interface Stats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  favoriteRestaurants: number;
  averageRating: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    favoriteRestaurants: 0,
    averageRating: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch orders and favorites to compute stats
    const fetchDashboardData = async () => {
      try {
        const [ordersResponse, favoritesResponse] = await Promise.all([
          fetch('/api/students/orders'),
          fetch('/api/students/favorites')
        ]);

        if (ordersResponse.ok && favoritesResponse.ok) {
          const orders = await ordersResponse.json();
          const favorites = await favoritesResponse.json();

          // Compute stats from real data
          const totalOrders = orders.length;
          const activeOrders = orders.filter((order: Order) => 
            ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'in_transit'].includes(order.status)
          ).length;
          const completedOrders = orders.filter((order: Order) => 
            order.status === 'delivered'
          ).length;
          const totalSpent = orders.reduce((sum: number, order: Order) => sum + order.total, 0);
          const favoriteRestaurants = favorites.length;
          const averageRating = favorites.length > 0 
            ? favorites.reduce((sum: number, restaurant: Restaurant) => sum + restaurant.rating, 0) / favorites.length
            : 0;

          setStats({
            totalOrders,
            activeOrders,
            completedOrders,
            totalSpent,
            favoriteRestaurants,
            averageRating: Math.round(averageRating * 10) / 10
          });

          // Get recent orders (last 3)
          const sortedOrders = orders
            .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      case 'picked_up':
        return 'text-purple-600 bg-purple-100';
      case 'ready':
        return 'text-orange-600 bg-orange-100';
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'accepted':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_transit':
        return <Package className="w-4 h-4" />;
      case 'picked_up':
        return <Package className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'preparing':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your food orders today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorite Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favoriteRestaurants}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Star className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link 
              href="/dashboard/student/orders"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400">Start exploring restaurants and place your first order!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{order.restaurantName}</h3>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ₦{order.total.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </span>
                    <Link 
                      href={`/dashboard/student/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link 
            href="/marketplace"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Explore Restaurants</h3>
                <p className="text-blue-100">Discover new places to eat</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/student/favorites"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">My Favorites</h3>
                <p className="text-red-100">View your saved restaurants</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/dashboard/student/support"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Get Support</h3>
                <p className="text-green-100">Need help? Contact us</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}





