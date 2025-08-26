'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  Shield,
  UserCheck,
  UserX,
  Building,
  CreditCard,
  Globe
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  university: string;
  createdAt: string;
  lastActive: string;
}

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalRiders: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeUsers: number;
  platformRating: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalRiders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    platformRating: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockStats = {
    totalUsers: 1250,
    totalRestaurants: 45,
    totalRiders: 89,
    totalOrders: 3456,
    totalRevenue: 25000000,
    pendingApprovals: 12,
    activeUsers: 890,
    platformRating: 4.7
  };

  const mockRecentUsers: User[] = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      role: 'student',
      status: 'active',
      university: 'University of Lagos',
      createdAt: '2024-01-15T10:30:00Z',
      lastActive: '2024-01-15T14:20:00Z'
    },
    {
      _id: '2',
      name: 'Pizza Palace',
      email: 'info@pizzapalace.com',
      role: 'restaurant',
      status: 'active',
      university: 'University of Lagos',
      createdAt: '2024-01-15T09:15:00Z',
      lastActive: '2024-01-15T13:45:00Z'
    },
    {
      _id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      role: 'rider',
      status: 'active',
      university: 'University of Lagos',
      createdAt: '2024-01-15T08:45:00Z',
      lastActive: '2024-01-15T12:30:00Z'
    }
  ];

  const mockPendingApprovals: User[] = [
    {
      _id: '4',
      name: 'New Restaurant',
      email: 'new@restaurant.com',
      role: 'restaurant',
      status: 'pending',
      university: 'University of Lagos',
      createdAt: '2024-01-15T07:30:00Z',
      lastActive: '2024-01-15T07:30:00Z'
    },
    {
      _id: '5',
      name: 'New Rider',
      email: 'new@rider.com',
      role: 'rider',
      status: 'pending',
      university: 'University of Lagos',
      createdAt: '2024-01-15T06:15:00Z',
      lastActive: '2024-01-15T06:15:00Z'
    }
  ];

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setRecentUsers(mockRecentUsers);
      setPendingApprovals(mockPendingApprovals);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'restaurant':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'rider':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'admin':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student':
        return <Users className="h-4 w-4" />;
      case 'restaurant':
        return <Building className="h-4 w-4" />;
      case 'rider':
        return <Truck className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="admin" userName={user?.name || 'Admin'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user?.name || 'Admin';
  const displayName = userName === 'Admin' ? 'Admin' : userName;

  return (
    <DashboardLayout userRole="admin" userName={displayName}>
      <div className="space-y-3 sm:space-y-4">
        {/* Enhanced Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-xl p-4 sm:p-5 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white">Admin Dashboard</h1>
              <p className="text-white/90 text-sm">Manage the platform and monitor all activities</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">{stats.pendingApprovals}</div>
                <div className="text-xs sm:text-sm text-white/80">Pending Approvals</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white">{stats.activeUsers}</div>
                <div className="text-xs sm:text-sm text-white/80">Active Users</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          <Link
            href="/dashboard/admin/users"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Manage Users</h3>
                <p className="text-xs text-white/80">{stats.totalUsers} total</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/restaurants"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Building className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Restaurants</h3>
                <p className="text-xs text-white/80">{stats.totalRestaurants} active</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/riders"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Riders</h3>
                <p className="text-xs text-white/80">{stats.totalRiders} active</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/analytics"
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 sm:p-4 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl min-h-[80px] sm:min-h-[100px] flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              <div>
                <h3 className="font-semibold text-xs sm:text-sm">Analytics</h3>
                <p className="text-xs text-white/80">View insights</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Stats Cards - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        >
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Building className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base sm:text-lg font-bold text-gray-900">{stats.totalRestaurants}</p>
                <p className="text-xs text-gray-500">Restaurants</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRiders}</p>
                <p className="text-xs text-gray-500">Riders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
              <Link 
                href="/dashboard/admin/approvals"
                className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-lg border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600 capitalize">{user.role} • {user.university}</p>
                          <p className="text-sm text-gray-500">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                        <UserCheck className="h-3 w-3 inline mr-1" />
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                        <UserX className="h-3 w-3 inline mr-1" />
                        Reject
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors">
                        <Eye className="h-3 w-3 inline mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending approvals</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  All user applications have been processed!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link 
                href="/dashboard/admin/users"
                className="text-brand-primary hover:text-brand-accent text-sm font-medium flex items-center"
              >
                View All Users
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg border ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-600 capitalize">{user.role} • {user.university}</p>
                        <p className="text-sm text-gray-500">
                          Last active: {new Date(user.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Platform Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">📊 Platform Stats</h3>
                <p className="text-blue-100 mb-3">{stats.totalOrders} orders processed</p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  View Analytics
                </button>
              </div>
              <BarChart3 className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">⭐ Platform Rating</h3>
                <p className="text-green-100 mb-3">{stats.platformRating}★ average rating</p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  View Reviews
                </button>
              </div>
              <Star className="h-12 w-12 text-green-200" />
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
