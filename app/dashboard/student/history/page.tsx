'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Star, 
  MapPin, 
  CreditCard,
  Receipt,
  ShoppingBag,
  BarChart3,
  Filter,
  Download,
  Eye
} from 'lucide-react';

export default function OrderHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [selectedRestaurant, setSelectedRestaurant] = useState('All');

  const periods = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'All Time'];
  
  const orderHistory = [
    {
      id: 'ORD-001',
      restaurant: 'Campus Delight',
      date: '2024-01-15',
      time: '14:30',
      total: '₦1,800',
      status: 'Delivered',
      rating: 5,
      items: 3,
      deliveryTime: '25 min'
    },
    {
      id: 'ORD-002',
      restaurant: 'Pizza Palace',
      date: '2024-01-14',
      time: '19:15',
      total: '₦2,700',
      status: 'Delivered',
      rating: 4,
      items: 2,
      deliveryTime: '30 min'
    },
    {
      id: 'ORD-003',
      restaurant: 'Burger House',
      date: '2024-01-13',
      time: '12:00',
      total: '₦4,100',
      status: 'Cancelled',
      rating: null,
      items: 3,
      deliveryTime: null
    },
    {
      id: 'ORD-004',
      restaurant: 'Sweet Treats',
      date: '2024-01-12',
      time: '16:45',
      total: '₦1,200',
      status: 'Delivered',
      rating: 5,
      items: 2,
      deliveryTime: '15 min'
    },
    {
      id: 'ORD-005',
      restaurant: 'Campus Coffee',
      date: '2024-01-11',
      time: '09:30',
      total: '₦800',
      status: 'Delivered',
      rating: 4,
      items: 2,
      deliveryTime: '10 min'
    },
    {
      id: 'ORD-006',
      restaurant: 'Asian Fusion',
      date: '2024-01-10',
      time: '18:20',
      total: '₦3,500',
      status: 'Delivered',
      rating: 5,
      items: 4,
      deliveryTime: '35 min'
    }
  ];

  const restaurants = ['All', ...Array.from(new Set(orderHistory.map(order => order.restaurant)))];

  const filteredHistory = orderHistory.filter(order => {
    const matchesRestaurant = selectedRestaurant === 'All' || order.restaurant === selectedRestaurant;
    return matchesRestaurant;
  });

  const stats = {
    totalOrders: filteredHistory.length,
    totalSpent: filteredHistory.reduce((sum, order) => sum + parseInt(order.total.replace('₦', '').replace(',', '')), 0),
    averageRating: filteredHistory.filter(order => order.rating).reduce((sum, order) => sum + order.rating!, 0) / filteredHistory.filter(order => order.rating).length,
    averageDeliveryTime: filteredHistory.filter(order => order.deliveryTime).reduce((sum, order) => sum + parseInt(order.deliveryTime!.split(' ')[0]), 0) / filteredHistory.filter(order => order.deliveryTime).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Arrow */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-start">
            <BackArrow href="/dashboard/student" />
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-1">View your past orders and insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 text-gray-600" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageDeliveryTime)} min</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {periods.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Restaurant:</span>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant} value={restaurant}>{restaurant}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.restaurant}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.date}</div>
                      <div className="text-sm text-gray-500">{order.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.total}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-900">{order.rating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-brand-primary hover:text-brand-accent">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Receipt className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No order history found</h3>
            <p className="text-gray-600">Try adjusting your filters or place your first order</p>
          </div>
        )}
      </div>
    </div>
  );
}

