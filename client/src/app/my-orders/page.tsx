'use client';

import { useState, useEffect, useMemo } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Order } from '@/types';
import {
  ClipboardList,
  IndianRupee,
  Banknote,
  Smartphone,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

// Payment method badge config
const paymentBadge: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  cash: {
    label: 'Cash',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <Banknote className="size-3" />,
  },
  upi: {
    label: 'UPI',
    classes: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: <Smartphone className="size-3" />,
  },
  card: {
    label: 'Card',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <CreditCard className="size-3" />,
  },
};

// Format time from ISO string
function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Loading Skeleton ────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="flex-1" />
          <div className="h-4 bg-slate-200 rounded w-12" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-14" />
        </div>
      ))}
    </div>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  colorClasses,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClasses: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main My Orders Page ─────────────────────────────────────────────
export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders
  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter to today's orders
  const todaysOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((order) => new Date(order.createdAt).toDateString() === today);
  }, [orders]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = todaysOrders.reduce((sum, o) => sum + o.total, 0);
    const cashTotal = todaysOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.total, 0);
    const upiTotal = todaysOrders
      .filter((o) => o.paymentMethod === 'upi')
      .reduce((sum, o) => sum + o.total, 0);
    const cardTotal = todaysOrders
      .filter((o) => o.paymentMethod === 'card')
      .reduce((sum, o) => sum + o.total, 0);

    return { total, cashTotal, upiTotal, cardTotal, count: todaysOrders.length };
  }, [todaysOrders]);

  return (
    <AppShell>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Today&apos;s orders by {user?.name?.split(' ')[0] ?? 'you'}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Earnings"
              value={`₹${stats.total.toLocaleString('en-IN')}`}
              icon={<IndianRupee className="size-5 text-amber-600" />}
              colorClasses="bg-amber-50"
            />
            <StatCard
              label="Cash"
              value={`₹${stats.cashTotal.toLocaleString('en-IN')}`}
              icon={<Banknote className="size-5 text-emerald-600" />}
              colorClasses="bg-emerald-50"
            />
            <StatCard
              label="UPI"
              value={`₹${stats.upiTotal.toLocaleString('en-IN')}`}
              icon={<Smartphone className="size-5 text-violet-600" />}
              colorClasses="bg-violet-50"
            />
            <StatCard
              label="Card"
              value={`₹${stats.cardTotal.toLocaleString('en-IN')}`}
              icon={<CreditCard className="size-5 text-blue-600" />}
              colorClasses="bg-blue-50"
            />
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <ClipboardList className="size-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">
              Orders ({stats.count})
            </h2>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-red-600 font-medium mb-1">Failed to load orders</p>
              <p className="text-xs text-slate-500 mb-3">{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Try again
              </button>
            </div>
          ) : todaysOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="size-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">No orders yet today</p>
              <p className="text-xs text-slate-400 mt-1">
                Orders placed from the billing screen will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left px-5 py-3">Order #</th>
                      <th className="text-left px-5 py-3">Time</th>
                      <th className="text-center px-5 py-3">Items</th>
                      <th className="text-right px-5 py-3">Total</th>
                      <th className="text-center px-5 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {todaysOrders.map((order) => {
                      const badge = paymentBadge[order.paymentMethod] || paymentBadge.cash;
                      const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-900">
                              #{order.orderNumber}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-600">
                              {formatTime(order.createdAt)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="text-sm text-slate-600">
                              {itemsCount}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-semibold text-slate-900">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}
                              >
                                {badge.icon}
                                {badge.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-slate-100">
                {todaysOrders.map((order) => {
                  const badge = paymentBadge[order.paymentMethod] || paymentBadge.cash;
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <div key={order._id} className="px-4 py-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.classes}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatTime(order.createdAt)} · {itemsCount} items</span>
                        <span className="font-semibold text-sm text-slate-900">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
