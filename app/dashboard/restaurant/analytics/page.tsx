'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  Clock,
  Calendar,
  Download,
  Filter,
  Eye,
  Award,
  Target,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  averageRating: number;
  completionRate: number;
  peakHours: Array<{ hour: string; orders: number }>;
  topItems: Array<{ name: string; orders: number; revenue: number }>;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  monthlyGrowth: number;
  weeklyGrowth: number;
}

export default function RestaurantAnalytics() {
  const [user, setUser] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    totalRevenue: 1250000,
    totalOrders: 156,
    averageOrderValue: 8012,
    customerCount: 89,
    averageRating: 4.6,
    completionRate: 94.8,
    peakHours: [
      { hour: '12:00', orders: 23 },
      { hour: '13:00', orders: 31 },
      { hour: '14:00', orders: 28 },
      { hour: '18:00', orders: 25 },
      { hour: '19:00', orders: 22 },
      { hour: '20:00', orders: 19 }
    ],
    topItems: [
      { name: 'Jollof Rice with Chicken', orders: 45, revenue: 54000 },
      { name: 'Margherita Pizza', orders: 38, revenue: 247000 },
      { name: 'Classic Burger', orders: 32, revenue: 57600 },
      { name: 'Chicken Wings', orders: 28, revenue: 42000 },
      { name: 'French Fries', orders: 25, revenue: 25000 }
    ],
    dailyRevenue: [
      { date: 'Mon', revenue: 45000 },
      { date: 'Tue', revenue: 52000 },
      { date: 'Wed', revenue: 48000 },
      { date: 'Thu', revenue: 61000 },
      { date: 'Fri', revenue: 68000 },
      { date: 'Sat', revenue: 75000 },
      { date: 'Sun', revenue: 42000 }
    ],
    monthlyGrowth: 12.5,
    weeklyGrowth: 8.3
  };

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
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  if (isLoading) {
    return (
      <DashboardLayout userRole="restaurant" userName={user?.name || 'Restaurant'}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout userRole="restaurant" userName={user?.name || 'Restaurant'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">Analytics will appear once you start receiving orders</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your restaurant's performance and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </motion.div>
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{(analyticsData.totalRevenue / 1000000).toFixed(1)}M</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{analyticsData.monthlyGrowth}%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{analyticsData.weeklyGrowth}%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₦{analyticsData.averageOrderValue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5.2%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.averageRating}/5</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">{analyticsData.customerCount} reviews</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Revenue</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.dailyRevenue.map((day, index) => (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-brand-primary rounded-t"
                    style={{ height: `${(day.revenue / 80000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                  <span className="text-xs text-gray-500">₦{(day.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Peak Hours Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {analyticsData.peakHours.map((hour, index) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{hour.hour}</span>
                  <div className="flex items-center space-x-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(hour.orders / 35) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{hour.orders}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Items and Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Top Selling Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₦{item.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Order Completion Rate</p>
                  <p className="text-sm text-gray-600">Orders successfully delivered</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.completionRate}%</p>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analyticsData.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Customer Satisfaction</p>
                  <p className="text-sm text-gray-600">Average rating from customers</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">{analyticsData.averageRating}/5</p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(analyticsData.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Total Customers</p>
                  <p className="text-sm text-gray-600">Unique customers served</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.customerCount}</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">customers</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
