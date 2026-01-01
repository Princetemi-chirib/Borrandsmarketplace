'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Phone, 
  MessageCircle,
  Star,
  RefreshCw,
  Package,
  Calendar,
  MapPin,
  User,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function RestaurantOrders() {
  const [user, setUser] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuses = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch {}
  }, []);

  const normalizeUiToApiStatus = (ui:string) => {
    const map:any = { Confirmed: 'accepted' };
    return (map[ui] || ui).toLowerCase();
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
    // Map UI status labels to API status values
    const statusMap: Record<string, string> = {
      'All': 'all',
      'Pending': 'pending',
      'Confirmed': 'accepted',
      'Preparing': 'preparing',
      'Ready': 'ready',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled'
    };
    return statusMap[status] || status.toLowerCase();
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
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
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
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
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
      case 'pending': return { label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700', next: 'accepted' };
      case 'accepted': return { label: 'Start Preparing', color: 'bg-orange-600 hover:bg-orange-700', next: 'preparing' };
      case 'preparing': return { label: 'Mark Ready', color: 'bg-green-600 hover:bg-green-700', next: 'ready' };
      case 'ready': return { label: 'Mark Picked Up', color: 'bg-purple-600 hover:bg-purple-700', next: 'picked_up' };
      case 'picked_up': return { label: 'Mark Delivered', color: 'bg-emerald-600 hover:bg-emerald-700', next: 'delivered' };
      default: return null;
    }
  };

  const updateOrderStatus = async (orderId:string, newStatus:string) => {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Convert lowercase status back to uppercase for API
    const apiStatus = newStatus.toUpperCase();
    const res = await fetch(`/api/orders/${orderId}`, { 
      method:'PATCH', 
      headers, 
      credentials:'include', 
      body: JSON.stringify({ status: apiStatus }) 
    });
    if (res.ok) await loadOrders();
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
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Manage incoming orders and track delivery status</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
              <RefreshCw className="h-4 w-4" />
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
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Orders</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
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
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent w-64"
              />
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
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
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">Placed at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{fmt(order.total)}</div>
                    <div className="text-sm text-gray-600">Est. delivery: {order.estimatedDeliveryTime} min</div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{order.customerName || 'Customer'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{order.customerPhone || ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item:any, itemIndex:number) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">×{item.quantity}</span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-medium">{fmt(item.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Instructions:</strong> {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Review (for delivered orders) */}
                {order.status === 'delivered' && order.rating && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{order.rating}/5 stars</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.review}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">View Details</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Message Customer</span>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {nextActionFor(order.status) && (
                      <button onClick={() => updateOrderStatus(order._id, nextActionFor(order.status)!.next)} className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${nextActionFor(order.status)!.color}`}>
                        <Check className="h-4 w-4" />
                        <span className="text-sm">{nextActionFor(order.status)!.label}</span>
                      </button>
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
          ))}

          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">No orders match your current filters</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}





