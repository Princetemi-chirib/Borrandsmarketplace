'use client';
// Updated: Removed mock data, now fetches real data from /api/students/orders

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle,
  Star,
  RefreshCw,
  AlertCircle,
  Package,
  Calendar,
  CreditCard,
  Receipt,
  ShoppingBag
} from 'lucide-react';

export default function MyOrders() {
  const [selectedStatus, setSelectedStatus] = useState('All');

  const statuses = ['All', 'Active', 'Completed', 'Cancelled'];
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const statusParam = selectedStatus.toLowerCase() === 'all' ? 'all' : selectedStatus.toLowerCase();
      const url = `/api/students/orders?status=${encodeURIComponent(statusParam)}&limit=50`;
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      
      // Normalize orders: status to lowercase, parse items if stringified
      const normalizedOrders = (data.orders || []).map((order: any) => ({
        ...order,
        status: order.status?.toLowerCase() || 'pending',
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        restaurantName: order.restaurant?.name || order.restaurantName || 'Restaurant',
        total: typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0
      }));
      
      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const filteredOrders = orders; // API already filters by status

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-start">
              <BackArrow href="/dashboard/student" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Arrow */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-start">
            <BackArrow href="/dashboard/student" />
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track your current orders and view order history</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Restaurant Logo */}
                    {order.restaurant?.logo && order.restaurant.logo.trim() !== '' && (
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img
                          src={order.restaurant.logo.startsWith('http') || order.restaurant.logo.startsWith('/') ? order.restaurant.logo : `/${order.restaurant.logo}`}
                          alt={`${order.restaurant?.name || 'Restaurant'} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.restaurant?.name || order.restaurantName || 'Restaurant'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order #{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">₦{typeof order.total === 'number' ? order.total.toLocaleString() : order.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {order.orderTime || new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {order.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">×{item.quantity}</span>
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CreditCard className="h-4 w-4" />
                      <span>Paid with {order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Estimated delivery: {order.estimatedDelivery}</span>
                    </div>
                    {order.status === 'completed' && order.rating && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600 dark:text-gray-400">{order.rating}/5 stars</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Steps (for active orders) */}
                {order.status === 'active' && order.trackingSteps && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Progress</h4>
                    <div className="space-y-3">
                      {order.trackingSteps.map((step: any, stepIndex: number) => (
                        <div key={stepIndex} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {step.step}
                            </span>
                            {step.time && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{step.time}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review (for completed orders) */}
                {order.status === 'completed' && order.review && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Your Review</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.review}</p>
                  </div>
                )}

                {/* Cancel Reason (for cancelled orders) */}
                {order.status === 'cancelled' && order.cancelReason && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-900 dark:text-red-200">Cancellation Reason</span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">{order.cancelReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                                 <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                   <div className="flex space-x-2">
                     <Link
                       href={`/dashboard/student/orders/${order.id}`}
                       className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                     >
                       <Truck className="h-4 w-4" />
                       <span className="text-sm">Track Order</span>
                     </Link>
                     <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                       <Receipt className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                       <span className="text-sm text-gray-700 dark:text-gray-300">View Receipt</span>
                     </button>
                     {order.status === 'active' && (
                       <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                         <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                         <span className="text-sm text-gray-700 dark:text-gray-300">Contact Support</span>
                       </button>
                     )}
                   </div>
                  <div className="flex space-x-2">
                    {order.status === 'active' && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Cancel Order</span>
                      </button>
                    )}
                    {order.status === 'completed' && !order.rating && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">Rate Order</span>
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="text-sm">Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">You haven't placed any orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
