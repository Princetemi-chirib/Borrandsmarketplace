'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BackArrow from '@/components/ui/BackArrow';
import { 
  DollarSign, 
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
  AlertCircle,
  BarChart3,
  CreditCard
} from 'lucide-react';

interface EarningsData {
  total: number;
  deliveryCount: number;
  average: number;
  period: string;
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    count: number;
  }>;
}

export default function Earnings() {
  const [user, setUser] = useState<any>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [period, setPeriod] = useState<string>('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/riders/earnings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch earnings');
      }

      if (data.success) {
        setEarnings(data.earnings);
      }
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      setError(error.message || 'Failed to load earnings');
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

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
    { value: 'today', label: 'Today' }
  ];

  if (isLoading && !earnings) {
    return (
      <DashboardLayout userRole="rider" userName={user?.name || 'Rider'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading earnings...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
              <p className="text-sm text-gray-600 mt-1">Track your delivery earnings</p>
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

        {/* Period Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                period === p.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {earnings && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-8 w-8 opacity-80" />
                  <TrendingUp className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">₦{earnings.total.toLocaleString()}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-8 w-8 opacity-80" />
                  <BarChart3 className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Total Deliveries</p>
                <p className="text-3xl font-bold">{earnings.deliveryCount}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="h-8 w-8 opacity-80" />
                  <TrendingUp className="h-5 w-5 opacity-80" />
                </div>
                <p className="text-sm opacity-90 mb-1">Average per Delivery</p>
                <p className="text-3xl font-bold">₦{Math.round(earnings.average).toLocaleString()}</p>
              </motion.div>
            </div>

            {/* Daily Earnings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h2>
              {earnings.dailyEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No earnings for this period</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earnings.dailyEarnings.map((day, index) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatDate(day.date)}</p>
                          <p className="text-sm text-gray-600">{day.count} {day.count === 1 ? 'delivery' : 'deliveries'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-brand-primary">₦{day.earnings.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
