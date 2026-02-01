'use client';
// Updated: Removed mock data, now fetches real data from /api/students/orders and computes stats

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  ArrowRight,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  restaurantName: string;
  status: string;
  total: number;
  createdAt: string;
  deliveredAt?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  rating?: number;
  review?: string;
}

interface HistoryStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  averageRating: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/students/orders', { headers });
      
      if (response.ok) {
        const json = await response.json();
        // Unwrap response - API returns { orders, pagination }
        const rawOrders = json.orders || [];
        
        // Normalize: status to lowercase, parse items if stringified
        const ordersData = rawOrders.map((order: any) => ({
          ...order,
          status: order.status?.toLowerCase() || 'pending',
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
        }));
        
        setOrders(ordersData);
        
        // Compute stats from real data
        const totalOrders = ordersData.length;
        const completedOrders = ordersData.filter((order: Order) => order.status === 'delivered').length;
        const cancelledOrders = ordersData.filter((order: Order) => order.status === 'cancelled').length;
        const totalSpent = ordersData
          .filter((order: Order) => order.status === 'delivered')
          .reduce((sum: number, order: Order) => sum + order.total, 0);
        const averageOrderValue = totalSpent > 0 ? totalSpent / completedOrders : 0;
        const ratedOrders = ordersData.filter((order: Order) => order.rating && order.rating > 0);
        const averageRating = ratedOrders.length > 0 
          ? ratedOrders.reduce((sum: number, order: Order) => sum + (order.rating || 0), 0) / ratedOrders.length
          : 0;

        setStats({
          totalOrders,
          completedOrders,
          cancelledOrders,
          totalSpent,
          averageOrderValue: Math.round(averageOrderValue),
          averageRating: Math.round(averageRating * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            orderDate.setTime(new Date(order.createdAt).getTime());
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.createdAt) >= monthAgo);
          break;
      }
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'picked_up':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'ready':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'preparing':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'accepted':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName="Student">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order History</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your past orders and view detailed information
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelledOrders}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by restaurant or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orders ({filteredOrders.length})
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No orders found</p>
              <p className="text-gray-400 dark:text-gray-500">
                {orders.length === 0 
                  ? "You haven't placed any orders yet." 
                  : "Try adjusting your search or filters."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {order.restaurantName}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>Order #{order.orderNumber}</p>
                          <p>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatCurrency(order.total)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.createdAt)}
                            </span>
                            {order.deliveredAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Delivered: {formatDate(order.deliveredAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {order.rating && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < order.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-500'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{order.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/student/orders/${order._id}`}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

