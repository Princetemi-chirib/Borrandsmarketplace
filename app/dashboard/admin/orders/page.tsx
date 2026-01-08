'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Truck,
  Clock, 
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CheckCircle,
  X,
  Package
} from 'lucide-react';

interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  rider?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  createdAt: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface Rider {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('accepted'); // Default to ACCEPTED for rider assignment
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchRiders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const ordersData = data.orders || [];
        console.log('Fetched orders:', ordersData.length);
        console.log('Sample order:', ordersData[0]);
        setOrders(ordersData);
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/riders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRiders(data.riders || []);
      }
    } catch (error) {
      console.error('Error fetching riders:', error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleAssignRider = async () => {
    if (!selectedOrder || !selectedRiderId) {
      toast.error('Please select a rider');
      return;
    }

    setAssignLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/assign-rider`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ riderId: selectedRiderId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Rider assigned successfully!');
        setShowAssignModal(false);
        setSelectedOrder(null);
        setSelectedRiderId('');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.message || 'Failed to assign rider');
      }
    } catch (error) {
      console.error('Error assigning rider:', error);
      toast.error('Error assigning rider');
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'text-blue-600 bg-blue-100';
      case 'PREPARING':
        return 'text-purple-600 bg-purple-100';
      case 'READY':
        return 'text-orange-600 bg-orange-100';
      case 'PICKED_UP':
        return 'text-yellow-600 bg-yellow-100';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage orders and assign riders to accepted orders
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number, restaurant, or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted (Need Rider)</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {statusFilter === 'accepted' 
                  ? 'No accepted orders awaiting rider assignment'
                  : 'No orders match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order #{order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Restaurant</p>
                          <p className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {order.restaurant.name}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Student</p>
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {order.student.name}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Delivery Address</p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {order.deliveryAddress}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Total</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">₦{order.total.toLocaleString()}</p>
                        </div>
                        {order.rider && (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Assigned Rider</p>
                            <p className="flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              {order.rider.name}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">Created</p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(order.status.toUpperCase() === 'PENDING' || order.status.toUpperCase() === 'ACCEPTED') && (!order.rider || !order.rider.id) && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAssignModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          Assign Rider
                        </button>
                      )}
                      {order.rider && order.rider.id && (
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                          Rider: {order.rider.name}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Assign Rider Modal */}
        {showAssignModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Rider</h2>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedOrder(null);
                      setSelectedRiderId('');
                    }}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order: <span className="font-semibold text-gray-900 dark:text-white">#{selectedOrder.orderNumber}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Restaurant: <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.restaurant.name}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer: <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.student.name}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery: <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.deliveryAddress}</span></p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Rider
                  </label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
                  >
                    <option value="">-- Select a rider --</option>
                    {riders.filter(r => r.isAvailable).map(rider => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name} {rider.isOnline ? '(Online)' : '(Offline)'} - {rider.vehicleType}
                      </option>
                    ))}
                  </select>
                  {riders.filter(r => r.isAvailable).length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">No available riders</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedOrder(null);
                      setSelectedRiderId('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignRider}
                    disabled={!selectedRiderId || assignLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Rider'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


