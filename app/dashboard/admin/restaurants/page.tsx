'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  X, 
  Clock, 
  AlertTriangle,
  Plus,
  MapPin,
  Phone,
  Mail,
  ChefHat,
  Users,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string[]; // Fixed: cuisine is an array
  address: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  university: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  userId: string; // Fixed: use userId instead of owner
  owner?: { // Keep for backward compatibility
    _id: string;
    name: string;
    phone: string;
  };
}

interface RestaurantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<RestaurantStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchTerm, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/restaurants');
      
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants);
        
        // Calculate stats
        const total = data.restaurants.length;
        const pending = data.restaurants.filter((r: Restaurant) => r.status === 'pending').length;
        const approved = data.restaurants.filter((r: Restaurant) => r.status === 'approved').length;
        const rejected = data.restaurants.filter((r: Restaurant) => r.status === 'rejected').length;
        const active = data.restaurants.filter((r: Restaurant) => r.status === 'approved' && r.isOpen).length;
        
        setStats({ total, pending, approved, rejected, active });
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.some(cuisine => cuisine.toLowerCase().includes(searchTerm.toLowerCase())) ||
        restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.owner?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.status === statusFilter);
    }

    setFilteredRestaurants(filtered);
  };

  const handleApproval = async (restaurantId: string, action: 'approve' | 'reject', reason?: string) => {
    setApprovalLoading(restaurantId);
    
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        // Refresh restaurants list
        await fetchRestaurants();
        
        // Close details modal if open
        if (showDetails) {
          setShowDetails(false);
          setSelectedRestaurant(null);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to process approval');
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Network error. Please try again.');
    } finally {
      setApprovalLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Management</h1>
          <p className="text-gray-600">
            Manage restaurant applications and monitor platform restaurants
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisine, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Restaurants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Restaurants ({filteredRestaurants.length})
            </h2>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No restaurants found</p>
              <p className="text-gray-400">
                {restaurants.length === 0 
                  ? "No restaurants have registered yet." 
                  : "Try adjusting your search or filters."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {restaurant.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(restaurant.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(restaurant.status)}
                              {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                            </span>
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4" />
                            {restaurant.cuisine.map((cuisine, i) => (
                              <span key={i}>{cuisine}{i < restaurant.cuisine.length - 1 ? ', ' : ''}</span>
                            ))}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {restaurant.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone}
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Owner: {restaurant.owner?.name || 'N/A'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(restaurant.createdAt)}
                            </span>
                            {restaurant.rating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {restaurant.rating}/5 ({restaurant.reviewCount} reviews)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {restaurant.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(restaurant._id, 'approve')}
                            disabled={approvalLoading === restaurant._id}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {approvalLoading === restaurant._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                handleApproval(restaurant._id, 'reject', reason);
                              }
                            }}
                            disabled={approvalLoading === restaurant._id}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {approvalLoading === restaurant._id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Restaurant Details Modal */}
        {showDetails && selectedRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Restaurant Details</h2>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedRestaurant(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900">{selectedRestaurant.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Cuisine</label>
                        <p className="text-gray-900">{selectedRestaurant.cuisine.map((cuisine, i) => (
                          <span key={i}>{cuisine}{i < selectedRestaurant.cuisine.length - 1 ? ', ' : ''}</span>
                        ))}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRestaurant.status)}`}>
                          {selectedRestaurant.status.charAt(0).toUpperCase() + selectedRestaurant.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">University</label>
                        <p className="text-gray-900">{selectedRestaurant.university}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                    <p className="text-gray-900">{selectedRestaurant.description}</p>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Address</label>
                        <p className="text-gray-900">{selectedRestaurant.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{selectedRestaurant.phone}</p>
                      </div>
                      
                      {(selectedRestaurant as any).website && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Website</label>
                          <a href={(selectedRestaurant as any).website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {(selectedRestaurant as any).website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Delivery Fee</label>
                        <p className="text-gray-900">₦{selectedRestaurant.deliveryFee.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Minimum Order</label>
                        <p className="text-gray-900">₦{selectedRestaurant.minimumOrder.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Delivery Time</label>
                        <p className="text-gray-900">{selectedRestaurant.estimatedDeliveryTime} minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* Owner Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Owner Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900">{selectedRestaurant.owner?.name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{selectedRestaurant.owner?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Registered:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedRestaurant.createdAt)}</span>
                      </div>
                      {selectedRestaurant.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Approved:</span>
                          <span className="text-sm text-gray-900">{formatDate(selectedRestaurant.approvedAt)}</span>
                        </div>
                      )}
                      {selectedRestaurant.rejectedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rejected:</span>
                          <span className="text-sm text-gray-900">{formatDate(selectedRestaurant.rejectedAt)}</span>
                        </div>
                      )}
                      {selectedRestaurant.rejectionReason && (
                        <div>
                          <span className="text-sm text-gray-600">Rejection Reason:</span>
                          <p className="text-sm text-gray-900 mt-1">{selectedRestaurant.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedRestaurant.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          handleApproval(selectedRestaurant._id, 'approve');
                          setShowDetails(false);
                        }}
                        disabled={approvalLoading === selectedRestaurant._id}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvalLoading === selectedRestaurant._id ? 'Processing...' : 'Approve Restaurant'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) {
                            handleApproval(selectedRestaurant._id, 'reject', reason);
                            setShowDetails(false);
                          }
                        }}
                        disabled={approvalLoading === selectedRestaurant._id}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvalLoading === selectedRestaurant._id ? 'Processing...' : 'Reject Restaurant'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
