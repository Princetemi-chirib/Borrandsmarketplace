'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { toast } from 'react-hot-toast';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Package,
  DollarSign,
  Navigation,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  User,
  Store
} from 'lucide-react';

interface AvailableOrder {
  _id: string;
  id: string;
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  studentName: string;
  studentPhone: string;
  status: string;
  total: number;
  deliveryFee: number;
  earnings: number;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  distance: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function AvailableDeliveries() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAvailableOrders();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAvailableOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/riders/available-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch available orders');
      }

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error fetching available orders:', error);
      setError(error.message || 'Failed to load available orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setIsAccepting(orderId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/riders/accept-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept order');
      }

      if (data.success) {
        toast.success('Order accepted successfully!');
        // Remove accepted order from list
        setOrders(orders.filter(order => order._id !== orderId));
        // Redirect to my deliveries
        setTimeout(() => {
          router.push('/dashboard/rider/my-deliveries');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error accepting order:', error);
      toast.error(error.message || 'Failed to accept order');
    } finally {
      setIsAccepting(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading available deliveries...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackArrow href="/dashboard/rider" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Deliveries</h1>
              <p className="text-sm text-gray-600 mt-1">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} available
              </p>
            </div>
          </div>
          <button
            onClick={fetchAvailableOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Deliveries</h3>
            <p className="text-gray-600 mb-6">
              There are no orders available for delivery at the moment. Check back soon!
            </p>
            <button
              onClick={fetchAvailableOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </motion.div>
        )}

        {/* Orders List */}
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-brand-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-primary">
                      ₦{order.earnings.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                </div>

                {/* Restaurant & Student Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-1">Pickup From</p>
                      <p className="text-sm font-semibold text-gray-900">{order.restaurantName}</p>
                      <p className="text-xs text-gray-600 mt-1">{order.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium mb-1">Deliver To</p>
                      <p className="text-sm font-semibold text-gray-900">{order.studentName}</p>
                      <p className="text-xs text-gray-600 mt-1">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-2">Order Items</p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Order Total</span>
                    <span className="text-sm font-bold text-gray-900">₦{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Delivery Instructions */}
                {order.deliveryInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-1">Delivery Instructions</p>
                    <p className="text-sm text-yellow-900">{order.deliveryInstructions}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={isAccepting === order._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isAccepting === order._id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Accept Delivery
                      </>
                    )}
                  </button>
                  <a
                    href={`tel:${order.studentPhone}`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${order.studentPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
