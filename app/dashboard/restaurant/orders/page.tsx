'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Phone, 
  MessageCircle,
  Star,
  RefreshCw,
  Package,
  MapPin,
  User,
  Eye,
  Check,
  X
} from 'lucide-react';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

function digitsForTelSms(phone: string | undefined | null): string {
  if (!phone || typeof phone !== 'string') return '';
  const t = phone.trim();
  if (!t) return '';
  if (t.startsWith('+')) return '+' + t.slice(1).replace(/\D/g, '');
  return t.replace(/\D/g, '');
}

function callCustomer(phone: string | undefined | null) {
  const d = digitsForTelSms(phone);
  if (!d) {
    toast.error('No phone number on file for this customer.');
    return;
  }
  window.location.href = `tel:${d}`;
}

function messageCustomer(order: { customerPhone?: string; customerName?: string; orderNumber?: string }) {
  const d = digitsForTelSms(order.customerPhone);
  if (!d) {
    toast.error('No phone number on file for this customer.');
    return;
  }
  const name = order.customerName || 'there';
  const num = order.orderNumber || '';
  const body = encodeURIComponent(
    `Hi ${name}, this is regarding your order${num ? ` #${num}` : ''}. `
  );
  window.location.href = `sms:${d}?body=${body}`;
}

export default function RestaurantOrders() {
  const [user, setUser] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [internalDeliveryEnabled, setInternalDeliveryEnabled] = useState(false);

  // Filter options match order flow: Pending → Confirmed → Picked up → Delivered (Cancelled separate)
  const statuses = ['All', 'Pending', 'Confirmed', 'Picked up', 'Delivered', 'Cancelled'];

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
  }, []);

  useEffect(() => {
    const loadDeliveryMode = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/restaurant/settings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (response.ok && data?.settings) {
          setInternalDeliveryEnabled(!!data.settings.internalDeliveryEnabled);
        }
      } catch {}
    };
    loadDeliveryMode();
  }, []);

  const normalizeUiToApiStatus = (ui: string): string => {
    const map: Record<string, string> = {
      'All': 'all',
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Picked up': 'picked_up',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
    };
    return map[ui] ?? ui.toLowerCase();
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const statusParam = selectedStatus === 'All' ? 'all' : normalizeUiToApiStatus(selectedStatus);
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/orders?status=${statusParam}`, { headers, credentials: 'include' });
      const json = await res.json();
      
      if (res.ok && json.orders) {
        // Normalize orders: parse items if stringified, normalize status to lowercase, map id to _id for UI
        const normalizedOrders = json.orders.map((order: any) => {
          let parsedItems = order.items;
          if (typeof order.items === 'string') {
            try {
              parsedItems = JSON.parse(order.items);
            } catch (parseError) {
              console.error('Failed to parse order items:', parseError);
              parsedItems = []; // Default to empty array on parse error
            }
          }
          return {
            ...order,
            _id: order.id || order._id, // Map id to _id for compatibility
            status: order.status?.toLowerCase() || 'pending',
            items: parsedItems
          };
        });
        setOrders(normalizedOrders);
      } else {
        setError(json.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  // Subscribe to server-sent events for real-time updates
  useEffect(() => {
    let es: EventSource | null = null;
    let isMounted = true;
    
    const setupEventSource = () => {
      try {
        const token = localStorage.getItem('token');
        const url = token ? `/api/orders/stream?token=${encodeURIComponent(token)}` : '/api/orders/stream';
        es = new EventSource(url);
        
        const onUpdate = () => {
          if (isMounted) {
            loadOrders();
          }
        };
        
        const onError = () => {
          if (es && isMounted) {
            es.close();
            es = null;
            // Retry after 5 seconds
            setTimeout(() => {
              if (isMounted) {
                setupEventSource();
              }
            }, 5000);
          }
        };
        
        es.addEventListener('order.updated', onUpdate);
        es.addEventListener('connected', () => {});
        es.addEventListener('ping', () => {});
        es.onerror = onError;
      } catch (error) {
        console.error('Error setting up EventSource:', error);
        if (es) {
          es.close();
          es = null;
        }
      }
    };
    
    setupEventSource();
    
    return () => {
      isMounted = false;
      if (es) {
        es.close();
        es = null;
      }
    };
  }, []);
  
  const fmt = (n:number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

  const getNormalizedStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'All': 'all',
      'Pending': 'pending',
      'Confirmed': 'confirmed',
      'Picked up': 'picked_up',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
    };
    return statusMap[status] ?? status.toLowerCase();
  };

  const filteredOrders = orders.filter((order:any) => {
    const normalizedSelectedStatus = getNormalizedStatus(selectedStatus);
    const matchesStatus = normalizedSelectedStatus === 'all' || order.status === normalizedSelectedStatus;
    const matchesSearch = (order.customerName || order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'picked_up':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'picked_up':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Truck className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const nextActionFor = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700', next: 'confirmed' };
      case 'confirmed':
        if (internalDeliveryEnabled) {
          return { label: 'Start Delivery', color: 'bg-purple-600 hover:bg-purple-700', next: 'picked_up' };
        }
        return null;
      case 'picked_up':
        if (internalDeliveryEnabled) {
          return { label: 'Mark Delivered', color: 'bg-green-600 hover:bg-green-700', next: 'delivered' };
        }
        return null;
      default: return null;
    }
  };

  const updateOrderStatus = async (orderId:string, newStatus:string) => {
    setError('');
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const apiStatus = newStatus.toUpperCase();
    const res = await fetch(`/api/orders/${orderId}`, { 
      method:'PATCH', 
      headers, 
      credentials:'include', 
      body: JSON.stringify({ status: apiStatus }) 
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      await loadOrders();
    } else {
      setError(data.message || 'Failed to update order');
    }
  };

  const userName = user?.name || 'Restaurant';
  const displayName = userName === 'Restaurant' ? 'Restaurant' : userName;

  return (
    <DashboardLayout userRole="restaurant" userName={displayName}>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <BackArrow href="/dashboard/restaurant" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage incoming orders and track delivery status</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => loadOrders()}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Orders</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <SkeletonLoader type="card" count={3} />
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'No orders match your search criteria.' : 'No orders available for this status.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order, index) => (
            <motion.div
              key={order._id || order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Placed at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(order.subtotal ?? order.total)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Est. delivery: {order.estimatedDeliveryTime} min</div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName || 'Customer'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{order.customerPhone || ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => callCustomer(order.customerPhone)}
                      aria-label="Call customer"
                      title={order.customerPhone ? 'Call customer' : 'No phone on file'}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => messageCustomer(order)}
                      aria-label="Message customer"
                      title={order.customerPhone ? 'Text customer' : 'No phone on file'}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item:any, itemIndex:number) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">×{item.quantity}</span>
                        <span className="text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">{fmt(item.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Special Instructions:</strong> {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Review (for delivered orders) */}
                {order.status === 'delivered' && order.rating && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{order.rating}/5 stars</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.review}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailOrder(order)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">View Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => messageCustomer(order)}
                      title={order.customerPhone ? 'Open SMS to customer' : 'No phone on file'}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Message Customer</span>
                    </button>
                  </div>
                  <div className="flex space-x-2 flex-wrap gap-2">
                    {nextActionFor(order.status) && (
                      <button onClick={() => updateOrderStatus(order._id, nextActionFor(order.status)!.next)} className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${nextActionFor(order.status)!.color}`}>
                        <Check className="h-4 w-4" />
                        <span className="text-sm">{nextActionFor(order.status)!.label}</span>
                      </button>
                    )}
                    {order.status === 'confirmed' && !order.riderId && !internalDeliveryEnabled && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 self-center">Waiting for rider assignment</span>
                    )}
                    {order.status === 'pending' && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <X className="h-4 w-4" />
                        <span className="text-sm">Reject Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
              ))
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {detailOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-detail-title"
              onClick={() => setDetailOrder(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: 'spring', damping: 26 }}
                className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 id="order-detail-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{detailOrder.orderNumber}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDetailOrder(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto px-5 py-4 space-y-4 text-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(detailOrder.status)}`}>
                      {getStatusIcon(detailOrder.status)}
                      {detailOrder.status?.replace('_', ' ') || '—'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {detailOrder.createdAt
                        ? new Date(detailOrder.createdAt).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Customer</h3>
                    <p className="text-gray-700 dark:text-gray-300">{detailOrder.customerName || '—'}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => callCustomer(detailOrder.customerPhone)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </button>
                      <button
                        type="button"
                        onClick={() => messageCustomer(detailOrder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </button>
                    </div>
                    {detailOrder.customerPhone && (
                      <p className="text-gray-600 dark:text-gray-400">{detailOrder.customerPhone}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      Delivery address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{detailOrder.deliveryAddress || '—'}</p>
                  </div>
                  {detailOrder.specialInstructions && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <strong className="text-yellow-900 dark:text-yellow-200">Instructions: </strong>
                      <span className="text-yellow-800 dark:text-yellow-100">{detailOrder.specialInstructions}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Items</h3>
                    <ul className="space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
                      {(Array.isArray(detailOrder.items) ? detailOrder.items : []).map((item: any, i: number) => (
                        <li key={i} className="flex justify-between gap-2 px-3 py-2">
                          <span className="text-gray-800 dark:text-gray-200">
                            ×{item.quantity} {item.name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white shrink-0">
                            {fmt(item.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {detailOrder.subtotal != null && (
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{fmt(detailOrder.subtotal)}</span>
                      </div>
                    )}
                    {detailOrder.deliveryFee != null && Number(detailOrder.deliveryFee) > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery fee</span>
                        <span>{fmt(detailOrder.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-900 dark:text-white text-base">
                      <span>Total</span>
                      <span>{fmt(detailOrder.total ?? detailOrder.subtotal ?? 0)}</span>
                    </div>
                    {detailOrder.estimatedDeliveryTime != null && (
                      <p className="text-xs text-gray-500 pt-1">
                        Est. delivery: {detailOrder.estimatedDeliveryTime} min
                      </p>
                    )}
                  </div>
                  {detailOrder.status === 'delivered' && detailOrder.rating && (
                    <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-400 fill-current shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{detailOrder.rating}/5</p>
                        {detailOrder.review && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{detailOrder.review}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setDetailOrder(null)}
                    className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}





