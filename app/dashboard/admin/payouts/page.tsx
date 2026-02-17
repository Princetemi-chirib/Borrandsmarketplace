'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  CreditCard,
  Building2,
  Calendar,
  Banknote,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
} from 'lucide-react';

interface UnpaidDay {
  date: string;
  amount: number;
}

interface RecentPayout {
  payoutDate: string;
  amount: number;
  paidAt: string;
  paidBy: string | null;
}

interface PayoutRestaurant {
  id: string;
  name: string;
  payoutBankName: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
  unpaidDays: UnpaidDay[];
  recentPayouts: RecentPayout[];
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [restaurants, setRestaurants] = useState<PayoutRestaurant[]>([]);
  const [from, setFrom] = useState('');
  const [days, setDays] = useState(90);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<{ restaurantId: string; date: string } | null>(null);
  const [markAmount, setMarkAmount] = useState('');
  const [markSubmitting, setMarkSubmitting] = useState(false);
  const [markAllDate, setMarkAllDate] = useState('');
  const [markAllSubmitting, setMarkAllSubmitting] = useState(false);
  const [showMarkAllModal, setShowMarkAllModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'ADMIN') {
        router.push('/auth/login');
        return;
      }
      setUser(parsed);
    } catch {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchPayouts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to load payouts');
        setRestaurants([]);
        return;
      }
      if (data.success && Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
        setFrom(data.from || '');
      } else {
        setRestaurants([]);
      }
    } catch (e) {
      setError('Network error. Please try again.');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchPayouts();
  }, [user, days]);

  const handleMarkPaid = (restaurantId: string, date: string, suggestedAmount: number) => {
    setMarkingPaid({ restaurantId, date });
    setMarkAmount(String(suggestedAmount));
  };

  const closeMarkModal = () => {
    setMarkingPaid(null);
    setMarkAmount('');
  };

  const submitMarkPaid = async () => {
    if (!markingPaid) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const amount = parseFloat(markAmount);
    if (isNaN(amount) || amount < 0) {
      return;
    }
    setMarkSubmitting(true);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId: markingPaid.restaurantId,
          date: markingPaid.date,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        closeMarkModal();
        fetchPayouts();
      } else {
        alert(data.message || 'Failed to record payout');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setMarkSubmitting(false);
    }
  };

  const submitMarkAllForDate = async () => {
    if (!markAllDate) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setMarkAllSubmitting(true);
    try {
      const res = await fetch('/api/admin/payouts/mark-all-for-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: markAllDate }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowMarkAllModal(false);
        setMarkAllDate('');
        fetchPayouts();
        alert(data.message || `Marked as paid for ${data.count || 0} restaurant(s).`);
      } else {
        alert(data.message || 'Failed to record payouts');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setMarkAllSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateTime = (s: string) =>
    new Date(s).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' });

  const hasPayoutDetails = (r: PayoutRestaurant) =>
    !!(r.payoutBankName || r.payoutAccountNumber || r.payoutAccountName);

  if (user == null) {
    return (
      <DashboardLayout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName={user?.name || 'Admin'}>
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Restaurant Payouts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View daily food revenue and mark payouts as paid after manual transfer
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Period:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
              <option value={365}>Last 365 days</option>
            </select>
            <button
              type="button"
              onClick={() => setShowMarkAllModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as paid for all (day)
            </button>
            <button
              type="button"
              onClick={fetchPayouts}
              disabled={isLoading}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {from && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing revenue from {formatDate(from)} to today
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[280px]">
            <LoadingSpinner size="lg" text="Loading payouts..." />
          </div>
        ) : restaurants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 sm:p-12 text-center"
          >
            <CreditCard className="h-14 w-14 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No restaurants to show
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              {error ? 'Fix the error above and refresh.' : 'There are no approved, active restaurants in the selected period.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((r, idx) => {
              const expanded = expandedId === r.id;
              const unpaidTotal = r.unpaidDays.reduce((sum, d) => sum + d.amount, 0);
              const hasUnpaid = r.unpaidDays.length > 0;

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20">
                        <Building2 className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                          {r.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {hasPayoutDetails(r)
                            ? `${r.payoutBankName || 'Bank'} • ${r.payoutAccountNumber || '—'} ${r.payoutAccountName ? `• ${r.payoutAccountName}` : ''}`
                            : 'Payout account not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      {hasUnpaid && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">
                          {r.unpaidDays.length} unpaid day{r.unpaidDays.length !== 1 ? 's' : ''} • ₦{unpaidTotal.toLocaleString()}
                        </span>
                      )}
                      {expanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 sm:p-5 space-y-5">
                        {/* Unpaid days */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Unpaid daily revenue
                          </h3>
                          {r.unpaidDays.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No unpaid days in this period.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                                    <th className="px-4 py-2.5 text-left font-medium text-gray-700 dark:text-gray-300">
                                      Date
                                    </th>
                                    <th className="px-4 py-2.5 text-right font-medium text-gray-700 dark:text-gray-300">
                                      Amount
                                    </th>
                                    <th className="px-4 py-2.5 w-32"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                  {r.unpaidDays.map((d) => (
                                    <tr key={d.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                      <td className="px-4 py-2.5 text-gray-900 dark:text-white">
                                        {formatDate(d.date)}
                                      </td>
                                      <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">
                                        ₦{d.amount.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2.5">
                                        <button
                                          type="button"
                                          onClick={() => handleMarkPaid(r.id, d.date, d.amount)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                                        >
                                          <CheckCircle className="h-3.5 w-3.5" />
                                          Mark as paid
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Recent payouts */}
                        {r.recentPayouts.length > 0 && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Recent payouts
                            </h3>
                            <ul className="space-y-2">
                              {r.recentPayouts.slice(0, 10).map((p) => (
                                <li
                                  key={`${p.payoutDate}-${p.paidAt}`}
                                  className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {formatDate(p.payoutDate)} → ₦{p.amount.toLocaleString()}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-500 text-xs">
                                    {formatDateTime(p.paidAt)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Mark as paid modal */}
        {markingPaid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mark as paid
                </h3>
                <button
                  type="button"
                  onClick={closeMarkModal}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Date: <strong className="text-gray-900 dark:text-white">{markingPaid.date && formatDate(markingPaid.date)}</strong>
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={markAmount}
                onChange={(e) => setMarkAmount(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Confirm the amount you paid to the restaurant, then record.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeMarkModal}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitMarkPaid}
                  disabled={markSubmitting || isNaN(parseFloat(markAmount)) || parseFloat(markAmount) < 0}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markSubmitting ? 'Recording...' : 'Record payout'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Mark as paid for all (day) modal */}
        {showMarkAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mark as paid for all (day)
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowMarkAllModal(false); setMarkAllDate(''); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Record payouts for every restaurant that has unpaid revenue on the selected date. One payout per restaurant will be created with that day&apos;s food revenue amount.
              </p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={markAllDate}
                onChange={(e) => setMarkAllDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowMarkAllModal(false); setMarkAllDate(''); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitMarkAllForDate}
                  disabled={markAllSubmitting || !markAllDate}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markAllSubmitting ? 'Recording...' : 'Mark all for this day'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
