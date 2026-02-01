'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Search,
  Filter,
  Bell,
  Truck,
  Package,
  Heart,
  Plus,
  ArrowRight,
  Zap,
  Award,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus as PlusIcon,
  Navigation,
  Target,
  Timer,
  Phone,
  MessageCircle
} from 'lucide-react';

interface Delivery {
  _id: string;
  orderId: string;
  restaurantName: string;
  studentName: string;
  status: string;
  earnings: number;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  estimatedPickupTime: string;
  estimatedDeliveryTime: string;
  distance: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  totalDistance: number;
  todayEarnings: number;
  weeklyEarnings: number;
}

export default function RiderDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalDistance: 0,
    todayEarnings: 0,
    weeklyEarnings: 0
  });
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check rider profile to get online status
        fetchRiderProfile();
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Fetch dashboard data
    fetchDashboardData();

    // Set up auto-refresh every 30 seconds for active deliveries
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiderProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/riders/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setIsOnline(data.profile.isOnline);
        }
      }
    } catch (error) {
      console.error('Error fetching rider profile:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const headers: any = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch stats, active deliveries, and recent deliveries in parallel
      const [statsResponse, activeResponse, historyResponse] = await Promise.all([
        fetch('/api/riders/stats', { headers }),
        fetch('/api/riders/active-deliveries', { headers }),
        fetch('/api/riders/delivery-history?limit=10', { headers })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.stats) {
          setStats(statsData.stats);
        }
      } else {
        console.error('Failed to fetch stats:', statsResponse.status);
      }

      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        if (activeData.success && activeData.deliveries) {
          setActiveDeliveries(activeData.deliveries);
        }
      } else {
        console.error('Failed to fetch active deliveries:', activeResponse.status);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData.success && historyData.deliveries) {
          setRecentDeliveries(historyData.deliveries);
        }
      } else {
        console.error('Failed to fetch delivery history:', historyResponse.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newOnlineStatus = !isOnline;

      const response = await fetch('/api/riders/toggle-online', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newOnlineStatus })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsOnline(data.rider.isOnline);
          // Refresh data if going online
          if (data.rider.isOnline) {
            fetchDashboardData();
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update online status');
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      setError('Failed to update online status');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/riders/accept-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    }
  };

  const handleUpdateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/riders/update-delivery-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status })
      });

      if (response.ok) {
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Failed to update delivery status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'picked_up':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Package className="h-4 w-4" />;
      case 'picked_up':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
      <div className="space-y-3 sm:space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl p-4 sm:p-5 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Rider Dashboard</h1>
              <p className="text-white/90 text-sm">Manage your deliveries and track your earnings</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold">{stats.activeDeliveries}</div>
                <div className="text-xs sm:text-sm text-white/80">Active Deliveries</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold">₦{(stats.todayEarnings / 1000).toFixed(0)}k</div>
                <div className="text-xs sm:text-sm text-white/80">Today's Earnings</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Online Status Toggle - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {isOnline ? 'Online - Available for Deliveries' : 'Offline - Not Available'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {isOnline ? 'You will receive delivery requests' : 'You will not receive new requests'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                isOnline 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </motion.div>

        {/* Quick Actions - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          <Link
            href="/dashboard/rider/deliveries"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Available Deliveries</h3>
                <p className="text-xs text-white/80 hidden sm:block">View new requests</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/rider/my-deliveries"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">My Deliveries</h3>
                <p className="text-xs text-white/80">{stats.activeDeliveries} active</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/rider/earnings"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <DollarSign className="h-6 w-6" />
              <div>
                <h3 className="font-semibold text-sm">Earnings</h3>
                <p className="text-xs text-white/80">Track your income</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/rider/location"
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <MapPin className="h-6 w-6" />
              <div>
                <h3 className="font-semibold text-sm">Location</h3>
                <p className="text-xs text-white/80">Update location</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
                <p className="text-xs text-gray-500">Total Deliveries</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₦{(stats.totalEarnings / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-500">Total Earnings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                <p className="text-xs text-gray-500">Avg Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Navigation className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistance}km</p>
                <p className="text-xs text-gray-500">Total Distance</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
              <Link 
                href="/dashboard/rider/my-deliveries"
                className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map((delivery, index) => (
                <motion.div
                  key={delivery._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-lg border ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{delivery.orderId.slice(-6)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                            {getStatusText(delivery.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Restaurant:</span> {delivery.restaurantName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Customer:</span> {delivery.studentName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Pickup:</span> {delivery.pickupAddress}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Delivery:</span> {delivery.deliveryAddress}
                          </p>
                          {delivery.items.map((item, itemIndex) => (
                            <p key={itemIndex} className="text-sm text-gray-600">
                              {item.quantity}x {item.name}
                            </p>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {delivery.distance}km
                            </span>
                            <span className="flex items-center">
                              <Timer className="h-4 w-4 mr-1" />
                              Est. {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₦{delivery.earnings.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex space-x-2">
                          {delivery.status === 'assigned' && (
                            <>
                              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                                Accept
                              </button>
                              <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                                Decline
                              </button>
                            </>
                          )}
                          {delivery.status === 'picked_up' && (
                            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                              Start Delivery
                            </button>
                          )}
                          <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors">
                            <Phone className="h-3 w-3 inline mr-1" />
                            Call
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors">
                            <MessageCircle className="h-3 w-3 inline mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No active deliveries</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You're all caught up! Check for new delivery requests or take a break.
                </p>
                <Link 
                  href="/dashboard/rider/deliveries"
                  className="btn-primary inline-flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Deliveries
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
              <Link 
                href="/dashboard/rider/history"
                className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
              >
                View History
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentDeliveries.map((delivery, index) => (
              <motion.div
                key={delivery._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg border ${getStatusColor(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{delivery.orderId.slice(-6)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                          {getStatusText(delivery.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Restaurant:</span> {delivery.restaurantName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Customer:</span> {delivery.studentName}
                        </p>
                        {delivery.items.map((item, itemIndex) => (
                          <p key={itemIndex} className="text-sm text-gray-600">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(delivery.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {delivery.distance}km
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₦{delivery.earnings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">💰 Today's Earnings</h3>
                <p className="text-green-100 mb-3">₦{stats.todayEarnings.toLocaleString()}</p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  View Details
                </button>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">📈 Weekly Performance</h3>
                <p className="text-blue-100 mb-3">₦{stats.weeklyEarnings.toLocaleString()} this week</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  View Analytics
                </button>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

