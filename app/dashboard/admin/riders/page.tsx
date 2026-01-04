'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Truck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  Clock, 
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Star,
  X,
  Plus
} from 'lucide-react';

interface Rider {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface RiderStats {
  total: number;
  online: number;
  available: number;
  offline: number;
  verified: number;
}

export default function AdminRiders() {
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [stats, setStats] = useState<RiderStats>({
    total: 0,
    online: 0,
    available: 0,
    offline: 0,
    verified: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    university: 'University of Lagos',
    vehicleType: 'MOTORCYCLE',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    licenseNumber: '',
    insuranceNumber: '',
    currentAddress: ''
  });

  useEffect(() => {
    fetchRiders();
  }, []);

  useEffect(() => {
    filterRiders();
  }, [riders, searchTerm, statusFilter]);

  const fetchRiders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/admin/riders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRiders(data.riders || []);
          
          // Calculate stats
          const total = data.riders.length;
          const online = data.riders.filter((r: Rider) => r.isOnline).length;
          const available = data.riders.filter((r: Rider) => r.isAvailable).length;
          const offline = total - online;
          const verified = data.riders.filter((r: Rider) => r.isVerified).length;
          
          setStats({ total, online, available, offline, verified });
        }
      } else {
        if (response.status === 401) {
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('Error fetching riders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRiders = () => {
    let filtered = riders;
    
    if (searchTerm) {
      filtered = filtered.filter(rider =>
        rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'online') {
        filtered = filtered.filter(r => r.isOnline);
      } else if (statusFilter === 'offline') {
        filtered = filtered.filter(r => !r.isOnline);
      } else if (statusFilter === 'available') {
        filtered = filtered.filter(r => r.isAvailable);
      }
    }
    
    setFilteredRiders(filtered);
  };

  const getStatusColor = (rider: Rider) => {
    if (!rider.isActive) return 'text-red-600 bg-red-100';
    if (rider.isOnline && rider.isAvailable) return 'text-green-600 bg-green-100';
    if (rider.isOnline) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (rider: Rider) => {
    if (!rider.isActive) return 'Inactive';
    if (rider.isOnline && rider.isAvailable) return 'Online & Available';
    if (rider.isOnline) return 'Online';
    return 'Offline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/riders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Rider created successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          university: 'University of Lagos',
          vehicleType: 'MOTORCYCLE',
          vehicleNumber: '',
          vehicleModel: '',
          vehicleColor: '',
          licenseNumber: '',
          insuranceNumber: '',
          currentAddress: ''
        });
        fetchRiders(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to create rider');
      }
    } catch (error) {
      console.error('Error creating rider:', error);
      toast.error('Error creating rider');
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rider Management</h1>
          <p className="text-gray-600">
            Manage riders and monitor their activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Riders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{stats.online}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-900">{stats.offline}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search riders by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Riders</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="available">Available</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Rider
              </button>
              <button
                onClick={fetchRiders}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Riders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {filteredRiders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No riders found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'No riders match your filters'
                  : 'No riders have been added yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRiders.map((rider, index) => (
                <motion.div
                  key={rider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rider.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rider)}`}>
                          {getStatusText(rider)}
                        </span>
                        {rider.isVerified && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Contact</p>
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {rider.email}
                          </p>
                          <p className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4" />
                            {rider.phone}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Vehicle</p>
                          <p className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            {rider.vehicleType} {rider.vehicleNumber && `- ${rider.vehicleNumber}`}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Performance</p>
                          <div className="flex items-center gap-4">
                            <p className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {rider.rating.toFixed(1)} ({rider.totalDeliveries} deliveries)
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Joined</p>
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(rider.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Rider Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Rider</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddRider} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Min. 6 characters"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                        <select
                          required
                          value={formData.university}
                          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="University of Lagos">University of Lagos</option>
                          <option value="Baze University">Baze University</option>
                          <option value="Veritas University">Veritas University</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                        <input
                          type="text"
                          value={formData.currentAddress}
                          onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                        <select
                          required
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="MOTORCYCLE">Motorcycle</option>
                          <option value="BICYCLE">Bicycle</option>
                          <option value="CAR">Car</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                        <input
                          type="text"
                          value={formData.vehicleModel}
                          onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Color</label>
                        <input
                          type="text"
                          value={formData.vehicleColor}
                          onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                        <input
                          type="text"
                          value={formData.insuranceNumber}
                          onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Rider'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

