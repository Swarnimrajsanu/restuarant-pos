'use client';

import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Order } from '@/types';
import {
  Search,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RefreshCw,
  User,
} from 'lucide-react';

const paymentMethodBadges: Record<string, string> = {
  cash: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  upi: 'bg-violet-100 text-violet-700 border-violet-200',
  card: 'bg-blue-100 text-blue-700 border-blue-200',
};

// ─── Order Row Component ────────────────────────────────────────────────────
function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
        <td className="px-5 py-4 font-semibold text-slate-900">{order.orderNumber}</td>
        <td className="px-5 py-4 text-slate-500">
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          <span className="text-slate-300">|</span>{' '}
          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <User className="size-3.5" />
            </div>
            <span className="font-medium text-slate-700">{order.workerId?.name || 'Unknown'}</span>
          </div>
        </td>
        <td className="px-5 py-4 text-slate-600">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </td>
        <td className="px-5 py-4 font-semibold text-slate-900">
          ₹{order.total.toLocaleString('en-IN')}
        </td>
        <td className="px-5 py-4">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm ${paymentMethodBadges[order.paymentMethod]}`}>
            {order.paymentMethod}
          </span>
        </td>
        <td className="px-5 py-4 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 gap-1.5 px-3 text-slate-500 hover:text-slate-700"
          >
            Details
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </td>
      </tr>

      {/* Expanded item details */}
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-slate-50/50 px-8 py-4">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h4>
              <div className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-5 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-slate-500">
                      ₹{item.price.toLocaleString('en-IN')} each <span className="mx-2 text-slate-300">·</span>{' '}
                      <span className="font-semibold text-slate-800">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extras & Totals Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-sm">
                {order.extraCharge && order.extraCharge > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{(order.total - order.extraCharge).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{order.extraChargeLabel || 'Extra Charge'}</span>
                      <span>+ ₹{order.extraCharge.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                ) : null}
                <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 text-base">
                  <span>Grand Total</span>
                  <span className="text-amber-600">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Orders Skeleton ────────────────────────────────────────────────────────
function OrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-white p-5 border border-slate-100">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Orders Page ───────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrders({
        search: search || undefined,
        date: date || undefined,
        paymentMethod: paymentMethod || undefined,
      });
      // Response comes as { orders, pagination }
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [search, date, paymentMethod]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and filter all orders placed in the system
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchOrders}
            disabled={loading}
            className="gap-2 self-start"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search order number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 text-slate-700"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchInput || date || paymentMethod !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setDate('');
                setPaymentMethod('all');
              }}
              className="text-slate-500 hover:text-slate-900"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              onClick={fetchOrders}
              className="ml-2 font-medium text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <OrdersSkeleton />}

        {/* Orders Table */}
        {!loading && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order Number
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date &amp; Time
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Worker (Cashier)
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Items
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Bill
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <ShoppingBag className="mx-auto mb-3 size-10 text-slate-300" />
                        <p className="text-sm text-slate-500">No orders found</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try adjusting your search query or filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => <OrderRow key={order._id} order={order} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order count */}
        {!loading && orders.length > 0 && (
          <p className="mt-4 text-sm text-slate-400">
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </AppShell>
  );
}
