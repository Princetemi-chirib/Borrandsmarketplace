'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// Uses real analytics APIs

export default function RestaurantAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simulate user data loading
    try {
      // Mock user data instead of localStorage
      const mockUser = { name: 'Tasty Bites Restaurant' };
      setUser(mockUser);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token') || '';
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      const range = selectedPeriod;
      const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;

      const [summaryRes, dailyRes, peakRes, topRes] = await Promise.all([
        fetch(`/api/analytics/summary?range=${encodeURIComponent(range)}`, { headers }),
        fetch(`/api/analytics/daily-revenue?days=${days}`, { headers }),
        fetch(`/api/analytics/peak-hours?days=${days}`, { headers }),
        fetch(`/api/analytics/top-items?days=${days}&limit=10`, { headers })
      ]);

      if (!summaryRes.ok) throw new Error('Failed to load summary');
      const summary = await summaryRes.json();
      const dailyJson = dailyRes.ok ? await dailyRes.json() : { dailyRevenue: [] };
      const peakJson = peakRes.ok ? await peakRes.json() : { peakHours: [] };
      const topJson = topRes.ok ? await topRes.json() : { topItems: [] };

      const data: AnalyticsData = {
        totalRevenue: summary.totalRevenue || 0,
        totalOrders: summary.totalOrders || 0,
        averageOrderValue: summary.averageOrderValue || 0,
        customerCount: summary.customerCount || 0,
        averageRating: summary.averageRating || 0,
        completionRate: Math.round((summary.completionRate || 0) * 10) / 10,
        peakHours: peakJson.peakHours || [],
        topItems: topJson.topItems || [],
        dailyRevenue: dailyJson.dailyRevenue || [],
        monthlyGrowth: summary.monthlyGrowth || 0,
        weeklyGrowth: summary.weeklyGrowth || 0,
      };

      setAnalyticsData(data);
    } catch (e: any) {
      console.error('Analytics loading error:', e);
      setError(e?.message || 'Failed to load analytics');
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const handleExport = () => {
    if (analyticsData) {
      const dataStr = JSON.stringify(analyticsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 text-sm mb-2">{error}</div>
              <button 
                onClick={loadAnalytics}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
              <p className="text-gray-600">Analytics will appear once you start receiving orders</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.name || 'Restaurant';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="text-sm text-gray-700 hover:text-gray-900" aria-label="Go back">← Back</button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Track your restaurant's performance and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Select time period"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button 
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Export analytics data"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders.toLocaleString()}</p>
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
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Daily Revenue</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.dailyRevenue.length > 0 ? (
                analyticsData.dailyRevenue.map((day, index) => {
                  const maxRevenue = Math.max(...analyticsData.dailyRevenue.map(d => d.revenue));
                  const heightPercentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={`${day.date}-${index}`} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-blue-600 rounded-t min-h-[4px] transition-all duration-300 hover:bg-blue-700"
                        style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                        title={`${day.date}: ₦${day.revenue.toLocaleString()}`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 truncate max-w-full">{day.date}</span>
                      <span className="text-xs text-gray-500">₦{(day.revenue / 1000).toFixed(0)}k</span>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Peak Hours Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {analyticsData.peakHours.length > 0 ? (
                analyticsData.peakHours.map((hour, index) => {
                  const maxOrders = Math.max(...analyticsData.peakHours.map(h => h.orders));
                  const widthPercentage = maxOrders > 0 ? (hour.orders / maxOrders) * 100 : 0;
                  
                  return (
                    <div key={`${hour.hour}-${index}`} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-20 flex-shrink-0">{hour.hour}</span>
                      <div className="flex items-center space-x-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${widthPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{hour.orders}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500">No peak hours data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Items and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Items</h3>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.topItems.length > 0 ? (
                analyticsData.topItems.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
                ))
              ) : (
                <div className="text-center text-gray-500">No top items data available</div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(analyticsData.completionRate, 100)}%` }}
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
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.customerCount.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">customers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}