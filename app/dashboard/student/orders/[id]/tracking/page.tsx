'use client';
// Updated: Removed mock data, now fetches real data from /api/students/orders/[id]

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Truck, 
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  User,
  Navigation,
  Package,
  Utensils,
  Bike
} from 'lucide-react';

interface OrderStatus {
  status: string;
  timestamp: Date;
  description: string;
  icon: any;
}

interface Rider {
  _id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  photo: string;
  rating: number;
  isOnline: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryAddress: string;
  deliveryInstructions: string;
  estimatedDeliveryTime: number;
  actualDeliveryTime?: Date;
  createdAt: Date;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
  rider?: Rider;
}

const orderStatuses: OrderStatus[] = [
  {
    status: 'pending',
    timestamp: new Date(),
    description: 'Order placed and waiting for restaurant confirmation',
    icon: Package
  },
  {
    status: 'accepted',
    timestamp: new Date(),
    description: 'Restaurant has accepted your order',
    icon: CheckCircle
  },
  {
    status: 'preparing',
    timestamp: new Date(),
    description: 'Your food is being prepared',
    icon: Utensils
  },
  {
    status: 'ready',
    timestamp: new Date(),
    description: 'Your order is ready for pickup',
    icon: Package
  },
  {
    status: 'picked_up',
    timestamp: new Date(),
    description: 'Rider has picked up your order',
    icon: Truck
  },
  {
    status: 'delivered',
    timestamp: new Date(),
    description: 'Order delivered successfully',
    icon: CheckCircle
  }
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [eta, setEta] = useState<number>(0);
  const [showRiderDetails, setShowRiderDetails] = useState(false);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/students/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load order');
      const o = data.order;
      const mapped: Order = {
        _id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        items: (o.items || []).map((it: any) => ({ name: it.name, quantity: it.quantity, price: it.price })),
        total: o.total,
        deliveryAddress: o.deliveryAddress,
        deliveryInstructions: o.deliveryInstructions,
        estimatedDeliveryTime: o.estimatedDeliveryTime,
        createdAt: new Date(o.createdAt),
        restaurant: {
          name: o.restaurant?.name || 'Restaurant',
          address: o.restaurant?.address || '',
          phone: o.restaurant?.phone || '',
          logo: o.restaurant?.logo || '',
        },
        rider: o.rider && {
          _id: o.rider._id,
          name: o.rider.name,
          phone: o.rider.phone,
          vehicleNumber: o.rider.vehicleNumber || '',
          photo: '',
          rating: 0,
          isOnline: true,
          currentLocation: { lat: 0, lng: 0 },
        },
      };
      setOrder(mapped);
      setCurrentStatus(orderStatuses.findIndex(s => s.status === mapped.status));
      setEta(mapped.estimatedDeliveryTime || 0);
    } catch (e) {
      console.error(e);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

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

    fetchOrder();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-blue-600 bg-blue-100';
      case 'preparing': return 'text-orange-600 bg-orange-100';
      case 'ready': return 'text-purple-600 bg-purple-100';
      case 'picked_up': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Package;
      case 'accepted': return CheckCircle;
      case 'preparing': return Utensils;
      case 'ready': return Package;
      case 'picked_up': return Truck;
      case 'delivered': return CheckCircle;
      default: return Package;
    }
  };

  const callRider = () => {
    if (order?.rider) {
      window.open(`tel:${order.rider.phone}`, '_self');
    }
  };

  const messageRider = () => {
    if (order?.rider) {
      window.open(`https://wa.me/${order.rider.phone.replace('+', '')}`, '_blank');
    }
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

  if (!order) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/student/orders')}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || 'Student'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              {/* Restaurant Logo */}
              {order.restaurant.logo && order.restaurant.logo.trim() !== '' && (
                <div className="mb-4">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <img
                      src={order.restaurant.logo.startsWith('http') || order.restaurant.logo.startsWith('/') ? order.restaurant.logo : `/${order.restaurant.logo}`}
                      alt={`${order.restaurant.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{order.restaurant.name}</h2>
              <p className="text-gray-600 mb-4">{order.restaurant.address}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order Total:</span>
                  <p className="font-semibold">₦{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Items:</span>
                  <p className="font-semibold">{order.items.length} items</p>
                </div>
                <div>
                  <span className="text-gray-500">Order Time:</span>
                  <p className="font-semibold">{order.createdAt.toLocaleTimeString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <p className="font-semibold">{order.estimatedDeliveryTime} minutes</p>
                </div>
              </div>
            </div>

            <div className="lg:text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {React.createElement(getStatusIcon(order.status), { className: 'h-4 w-4 mr-2' })}
                {order.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery ETA */}
        {order.status === 'picked_up' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Estimated Time of Arrival</h3>
                <p className="text-white/90">Your order is on its way!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{eta}</div>
                <div className="text-sm text-white/80">minutes</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          <div className="space-y-6">
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentStatus;
              const isCurrent = index === currentStatus;
              
              return (
                <div key={status.status} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      React.createElement(status.icon, { className: 'h-5 w-5' })
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {status.description}
                      </h3>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-brand-primary text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {status.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Rider Information */}
        {order.rider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Rider</h2>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  order.rider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                <span className="text-sm text-gray-500">
                  {order.rider.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.rider.name}</h3>
                <p className="text-sm text-gray-600">Vehicle: {order.rider.vehicleNumber}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">Rating:</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium ml-1">{order.rider.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={callRider}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={messageRider}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Delivery Address</p>
                <p className="text-gray-600">{order.deliveryAddress}</p>
              </div>
            </div>

            {order.deliveryInstructions && (
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Instructions</p>
                  <p className="text-gray-600">{order.deliveryInstructions}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Order Timeline</p>
                <p className="text-gray-600">
                  Ordered at {order.createdAt.toLocaleTimeString()} • 
                  Estimated delivery in {order.estimatedDeliveryTime} minutes
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg">₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
