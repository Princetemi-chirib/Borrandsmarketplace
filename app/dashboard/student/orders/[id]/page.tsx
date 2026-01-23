'use client';
// Updated: Removed mock data, now fetches real data from /api/students/orders/[id]

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle,
  Star,
  Package,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Navigation,
  Timer
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  time?: string;
  icon: any;
}

interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantLogo?: string;
  status: string;
  total: number;
  deliveryFee: number;
  subtotal: number;
  createdAt: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethod: string;
  riderName?: string;
  riderPhone?: string;
  riderPhoto?: string;
  trackingCode: string;
  specialInstructions?: string;
  rating?: number;
  review?: string;
}

export default function OrderTracking() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const statusFlow = ['pending','accepted','preparing','ready','picked_up','delivered'] as const;

  const deriveTracking = (status: string): TrackingStep[] => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const currentIndex = statusFlow.indexOf(normalizedStatus as any);
    const defs: Array<{ id: string; title: string; description: string; icon: any }> = [
      { id: '1', title: 'Order Placed', description: 'Your order has been received', icon: Package },
      { id: '2', title: 'Restaurant Confirmed', description: 'Restaurant has confirmed your order', icon: CheckCircle },
      { id: '3', title: 'Preparing', description: 'Your food is being prepared', icon: Clock },
      { id: '4', title: 'Ready for Pickup', description: 'Order is ready for pickup', icon: Package },
      { id: '5', title: 'Rider Picked Up', description: 'Rider has collected your order', icon: Truck },
      { id: '6', title: 'Delivered', description: 'Order has been delivered', icon: CheckCircle },
    ];
    return defs.map((d, idx) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      status: idx < currentIndex ? 'completed' : idx === currentIndex ? 'current' : 'pending',
      icon: d.icon,
    }));
  };

  useEffect(() => {
    const load = async () => {
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
        if (!o) {
          throw new Error('Order data is missing from response');
        }

        // Parse items if it's a JSON string
        let parsedItems = [];
        try {
          parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
        } catch (parseError) {
          console.error('Error parsing order items:', parseError);
          parsedItems = [];
        }

        const mapped: Order = {
          id: o._id || o.id,
          orderNumber: o.orderNumber,
          restaurantName: o.restaurant?.name || 'Restaurant',
          restaurantPhone: o.restaurant?.phone || '',
          restaurantLogo: o.restaurant?.logo || '',
          status: o.status?.toLowerCase() || 'pending',
          total: typeof o.total === 'number' ? o.total : parseFloat(o.total) || 0,
          deliveryFee: typeof o.deliveryFee === 'number' ? o.deliveryFee : parseFloat(o.deliveryFee) || 0,
          subtotal: typeof o.subtotal === 'number' ? o.subtotal : parseFloat(o.subtotal) || 0,
          createdAt: o.createdAt,
          estimatedDeliveryTime: o.estimatedDeliveryTime,
          items: parsedItems.map((it: any, idx: number) => ({
            id: it.itemId || it.id || String(idx),
            name: it.name || 'Item',
            quantity: it.quantity || 1,
            price: typeof it.price === 'number' ? it.price : parseFloat(it.price) || 0,
            image: it.image || '',
          })),
          deliveryAddress: o.deliveryAddress || '',
          paymentMethod: o.paymentMethod || 'CARD',
          riderName: o.rider?.name,
          riderPhone: o.rider?.phone,
          riderPhoto: '',
          trackingCode: o.trackingCode || o.orderNumber,
          specialInstructions: o.deliveryInstructions || '',
        };

        setOrder(mapped);
      } catch (e) {
        console.error('Error loading order:', e);
        console.error('Order ID:', orderId);
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orderId]);

  const refreshOrder = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleMarkAsReceived = async () => {
    if (!order) return;
    
    setIsCompleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'complete' })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Order marked as received!');
        // Refresh order data by reloading
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to mark order as received');
      }
    } catch (error) {
      console.error('Error marking order as received:', error);
      toast.error('Error marking order as received');
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const trackingSteps = useMemo(() => {
    if (!order) return [];
    return deriveTracking(order.status || 'pending');
  }, [order]);

  if (isLoading) {
    return (
      <DashboardLayout userRole="student" userName="Student">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout userRole="student" userName="Student">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order not found</h3>
          <p className="text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student" userName="Student">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Arrow */}
        <div className="flex justify-start mb-4">
          <BackArrow href="/dashboard/student/orders" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Restaurant Logo */}
            {order.restaurantLogo && order.restaurantLogo.trim() !== '' && (
              <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-xl shadow-sm flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                <img
                  src={order.restaurantLogo.startsWith('http') || order.restaurantLogo.startsWith('/') ? order.restaurantLogo : `/${order.restaurantLogo}`}
                  alt={`${order.restaurantName} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 dark:text-gray-400">{order.restaurantName}</p>
            </div>
          </div>
          <button
            onClick={refreshOrder}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{getStatusText(order.status)}</span>
                </span>
              </div>

              {/* Tracking Timeline */}
              <div className="space-y-4">
                {trackingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'completed' 
                        ? 'bg-green-500' 
                        : step.status === 'current'
                        ? 'bg-brand-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : step.status === 'current' ? (
                        <step.icon className="h-4 w-4 text-white" />
                      ) : (
                        <step.icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          step.status === 'completed' || step.status === 'current'
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.title}
                        </h3>
                        {step.time && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{step.time}</span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        step.status === 'completed' || step.status === 'current'
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">₦{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="text-gray-900 dark:text-white">₦{order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delivery Address</p>
                    <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Estimated Delivery</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Method</p>
                    <p className="text-gray-600 dark:text-gray-400">{order.paymentMethod}</p>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Special Instructions</p>
                      <p className="text-gray-600 dark:text-gray-400">{order.specialInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rider Information */}
            {order.riderName && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Rider</h3>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{order.riderName}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">#{order.trackingCode}</p>
                  
                  <div className="space-y-2">
                    {order.riderPhone && (
                      <a 
                        href={`tel:${order.riderPhone}`}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call Rider</span>
                      </a>
                    )}
                    {order.riderPhone && (
                      <a 
                        href={`https://wa.me/${order.riderPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message Rider</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Restaurant Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Restaurant</h3>
              
              <div className="space-y-3">
                {/* Restaurant Logo */}
                {order.restaurantLogo && order.restaurantLogo.trim() !== '' && (
                  <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-600 mx-auto mb-3">
                    <img
                      src={order.restaurantLogo.startsWith('http') || order.restaurantLogo.startsWith('/') ? order.restaurantLogo : `/${order.restaurantLogo}`}
                      alt={`${order.restaurantName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h4 className="font-medium text-gray-900 dark:text-white text-center">{order.restaurantName}</h4>
                
                <div className="space-y-2">
                  {order.restaurantPhone && (
                    <a 
                      href={`tel:${order.restaurantPhone}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Restaurant</span>
                    </a>
                  )}
                  {order.restaurantPhone && (
                    <a 
                      href={`https://wa.me/${order.restaurantPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message Restaurant</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                {(order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'picked_up') && (
                  <button
                    onClick={handleMarkAsReceived}
                    disabled={isCompleting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{isCompleting ? 'Marking...' : 'Mark as Received'}</span>
                  </button>
                )}
                <Link
                  href="/dashboard/student/support"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Get Help</span>
                </Link>
                {order.status.toLowerCase() === 'delivered' && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Star className="h-4 w-4" />
                    <span>Rate Order</span>
                  </button>
                )}
                <Link
                  href="/dashboard/student/restaurants"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  <span>Order Again</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

