'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  Clock, 
  CheckCircle, 
  Package,
  RefreshCw,
  AlertCircle,
  Store,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';

interface DeliveryHistory {
  _id: string;
  id: string;
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  studentName: string;
  status: string;
  total: number;
  deliveryFee: number;
  earnings: number;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  actualDeliveryTime?: string;
  estimatedDeliveryTime?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function DeliveryHistory() {
  const [user, setUser] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchHistory();
  }, [statusFilter]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const url = `/api/riders/delivery-history?status=${statusFilter}&limit=50`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch delivery history');
      }

      if (data.success) {
        setDeliveries(data.deliveries || []);
      } else {
        setDeliveries([]);
      }
    } catch (error: any) {
      console.error('Error fetching delivery history:', error);
      setError(error.message || 'Failed to load delivery history');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filteredDeliveries = deliveries;

  if (isLoading && deliveries.length === 0) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading delivery history...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
              <p className="text-sm text-gray-600 mt-1">
                {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'} completed
              </p>
            </div>
          </div>
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

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && deliveries.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Delivery History</h3>
            <p className="text-gray-600">
              You haven't completed any deliveries yet. Start accepting orders to build your history!
            </p>
          </motion.div>
        )}

        {/* Deliveries List */}
        <div className="grid gap-4">
          {filteredDeliveries.map((delivery, index) => (
            <motion.div
              key={delivery._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-brand-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{delivery.orderNumber}
                      </h3>
                      {delivery.status.toLowerCase() === 'delivered' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Delivered
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(delivery.createdAt)} at {formatTime(delivery.createdAt)}
                    </p>
                    {delivery.actualDeliveryTime && (
                      <p className="text-xs text-green-600 mt-1">
                        Delivered: {formatTime(delivery.actualDeliveryTime)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-primary">
                      ₦{delivery.earnings.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">Earnings</p>
                  </div>
                </div>

                {/* Restaurant & Student Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-1">Restaurant</p>
                      <p className="text-sm font-semibold text-gray-900">{delivery.restaurantName}</p>
                      <p className="text-xs text-gray-600 mt-1">{delivery.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium mb-1">Delivered To</p>
                      <p className="text-sm font-semibold text-gray-900">{delivery.studentName}</p>
                      <p className="text-xs text-gray-600 mt-1">{delivery.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-2">Order Items</p>
                  <div className="space-y-1">
                    {delivery.items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                    {delivery.items?.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{delivery.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Order Total</span>
                    <span className="text-sm font-bold text-gray-900">₦{delivery.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
