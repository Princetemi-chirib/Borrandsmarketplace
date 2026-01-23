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
  CheckCircle,
  RefreshCw,
  AlertCircle,
  User,
  Store,
  Navigation,
  PlayCircle
} from 'lucide-react';

interface ActiveDelivery {
  _id: string;
  id: string;
  orderId: string;
  orderNumber: string;
  restaurantName: string;
  restaurantPhone: string;
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
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function MyDeliveries() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchActiveDeliveries();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchActiveDeliveries, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveDeliveries = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/riders/active-deliveries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch active deliveries');
      }

      if (data.success) {
        setDeliveries(data.deliveries || []);
      } else {
        setDeliveries([]);
      }
    } catch (error: any) {
      console.error('Error fetching active deliveries:', error);
      setError(error.message || 'Failed to load active deliveries');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: 'PICKED_UP' | 'DELIVERED') => {
    try {
      setUpdatingStatus(orderId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const response = await fetch('/api/riders/update-delivery-status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      if (data.success) {
        toast.success(`Order marked as ${status === 'PICKED_UP' ? 'picked up' : 'delivered'}!`);
        // Refresh deliveries
        fetchActiveDeliveries();
        // If delivered, redirect to history after a moment
        if (status === 'DELIVERED') {
          setTimeout(() => {
            router.push('/dashboard/rider/history');
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'Ready for Pickup';
      case 'picked_up':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (isLoading && deliveries.length === 0) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading active deliveries...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
              <p className="text-sm text-gray-600 mt-1">
                {deliveries.length} {deliveries.length === 1 ? 'active delivery' : 'active deliveries'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchActiveDeliveries}
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
        {!isLoading && deliveries.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Deliveries</h3>
            <p className="text-gray-600 mb-6">
              You don't have any active deliveries at the moment. Check available deliveries to accept new orders.
            </p>
            <button
              onClick={() => router.push('/dashboard/rider/deliveries')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
            >
              <Package className="h-4 w-4" />
              View Available Deliveries
            </button>
          </motion.div>
        )}

        {/* Deliveries List */}
        <div className="grid gap-4">
          {deliveries.map((delivery, index) => (
            <motion.div
              key={delivery._id}
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
                        Order #{delivery.orderNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Earnings: ₦{delivery.earnings.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Restaurant & Student Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Store className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-1">Pickup From</p>
                      <p className="text-sm font-semibold text-gray-900">{delivery.restaurantName}</p>
                      <p className="text-xs text-gray-600 mt-1">{delivery.pickupAddress}</p>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={`tel:${delivery.restaurantPhone}`}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-green-600 font-medium mb-1">Deliver To</p>
                      <p className="text-sm font-semibold text-gray-900">{delivery.studentName}</p>
                      <p className="text-xs text-gray-600 mt-1">{delivery.deliveryAddress}</p>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={`tel:${delivery.studentPhone}`}
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${delivery.studentPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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
                </div>

                {/* Delivery Instructions */}
                {delivery.deliveryInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-1">Delivery Instructions</p>
                    <p className="text-sm text-yellow-900">{delivery.deliveryInstructions}</p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {delivery.status.toLowerCase() === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(delivery._id, 'PICKED_UP')}
                      disabled={updatingStatus === delivery._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {updatingStatus === delivery._id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Mark as Picked Up
                        </>
                      )}
                    </button>
                  )}
                  {delivery.status.toLowerCase() === 'picked_up' && (
                    <button
                      onClick={() => handleUpdateStatus(delivery._id, 'DELIVERED')}
                      disabled={updatingStatus === delivery._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {updatingStatus === delivery._id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Mark as Delivered
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/dashboard/rider/location?order=${delivery._id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    <span className="hidden sm:inline">Navigation</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
