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
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data.orders || []);
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
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
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
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your current orders and view order history</p>
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.restaurant}</h3>
                      <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{order.total}</div>
                    <div className="text-sm text-gray-600">{order.orderTime}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {order.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">×{item.quantity}</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      <span>Paid with {order.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Estimated delivery: {order.estimatedDelivery}</span>
                    </div>
                    {order.status === 'completed' && order.rating && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{order.rating}/5 stars</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Steps (for active orders) */}
                {order.status === 'active' && order.trackingSteps && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Progress</h4>
                    <div className="space-y-3">
                      {order.trackingSteps.map((step: any, stepIndex: number) => (
                        <div key={stepIndex} className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.step}
                            </span>
                            {step.time && (
                              <span className="text-xs text-gray-400 ml-2">{step.time}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review (for completed orders) */}
                {order.status === 'completed' && order.review && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">Your Review</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.review}</p>
                  </div>
                )}

                {/* Cancel Reason (for cancelled orders) */}
                {order.status === 'cancelled' && order.cancelReason && (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-900">Cancellation Reason</span>
                    </div>
                    <p className="text-sm text-red-700">{order.cancelReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                                 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                   <div className="flex space-x-2">
                     <Link
                       href={`/dashboard/student/orders/${order.id}`}
                       className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                     >
                       <Truck className="h-4 w-4" />
                       <span className="text-sm">Track Order</span>
                     </Link>
                     <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                       <Receipt className="h-4 w-4 text-gray-600" />
                       <span className="text-sm text-gray-700">View Receipt</span>
                     </button>
                     {order.status === 'active' && (
                       <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                         <MessageCircle className="h-4 w-4 text-gray-600" />
                         <span className="text-sm text-gray-700">Contact Support</span>
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">You haven't placed any orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
