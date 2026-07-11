'use client';

import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DailyReport, MonthlyReport, Order } from '@/types';
import {
  IndianRupee,
  ShoppingBag,
  Banknote,
  Smartphone,
  CreditCard,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

const paymentMethodBadges: Record<string, string> = {
  cash: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  upi: 'bg-violet-100 text-violet-700 border-violet-200',
  card: 'bg-blue-100 text-blue-700 border-blue-200',
};

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = [
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
];

// ─── Summary Card Component ──────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: string;
  count?: string;
  icon: React.ReactNode;
  accentBg: string;
  textColor: string;
}

function SummaryCard({ label, value, count, icon, accentBg, textColor }: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`text-xl font-bold tracking-tight ${textColor}`}>{value}</p>
          {count && <p className="text-xs text-slate-400">{count}</p>}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${accentBg} shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${accentBg} opacity-50`} />
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
              <Skeleton className="size-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

// ─── Main Reports Page ───────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('daily');

  // Daily report state
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Monthly report state
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  // Fetch Daily Report
  const fetchDailyReport = useCallback(async () => {
    try {
      setDailyLoading(true);
      setDailyError(null);
      const data = await api.getDailyReport(dailyDate);
      setDailyData(data);
    } catch (err) {
      setDailyError(err instanceof Error ? err.message : 'Failed to fetch daily report');
    } finally {
      setDailyLoading(false);
    }
  }, [dailyDate]);

  // Fetch Monthly Report
  const fetchMonthlyReport = useCallback(async () => {
    try {
      setMonthlyLoading(true);
      setMonthlyError(null);
      const data = await api.getMonthlyReport(monthlyMonth, monthlyYear);
      setMonthlyData(data);
    } catch (err) {
      setMonthlyError(err instanceof Error ? err.message : 'Failed to fetch monthly report');
    } finally {
      setMonthlyLoading(false);
    }
  }, [monthlyMonth, monthlyYear]);

  // Initial loads and tab change actions
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  }, [activeTab, fetchDailyReport, fetchMonthlyReport]);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Analyze restaurant sales performance by day or month
            </p>
          </div>
          <Button
            variant="outline"
            onClick={activeTab === 'daily' ? fetchDailyReport : fetchMonthlyReport}
            disabled={activeTab === 'daily' ? dailyLoading : monthlyLoading}
            className="gap-2 self-start"
          >
            <RefreshCw className={`size-4 ${activeTab === 'daily' ? (dailyLoading ? 'animate-spin' : '') : (monthlyLoading ? 'animate-spin' : '')}`} />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="daily" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="size-4" />
              Daily Report
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="size-4" />
              Monthly Report
            </TabsTrigger>
          </TabsList>

          {/* Daily Report Tab */}
          <TabsContent value="daily" className="space-y-6 outline-none">
            {/* Date selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Select Date:</span>
              <Input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="max-w-[200px]"
              />
            </div>

            {/* Error state */}
            {dailyError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {dailyError}
              </div>
            )}

            {/* Loading */}
            {dailyLoading && <ReportSkeleton />}

            {/* Daily Loaded Data */}
            {!dailyLoading && dailyData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <SummaryCard
                    label="Daily Revenue"
                    value={`₹${dailyData.summary.totalRevenue.toLocaleString('en-IN')}`}
                    icon={<IndianRupee className="size-4 text-white" />}
                    accentBg="bg-amber-500"
                    textColor="text-amber-600"
                  />
                  <SummaryCard
                    label="Total Orders"
                    value={dailyData.summary.totalOrders.toString()}
                    icon={<ShoppingBag className="size-4 text-white" />}
                    accentBg="bg-slate-700"
                    textColor="text-slate-900"
                  />
                  <SummaryCard
                    label="Cash Payment"
                    value={`₹${dailyData.summary.cashTotal.toLocaleString('en-IN')}`}
                    icon={<Banknote className="size-4 text-white" />}
                    accentBg="bg-emerald-500"
                    textColor="text-emerald-600"
                  />
                  <SummaryCard
                    label="UPI Payment"
                    value={`₹${dailyData.summary.upiTotal.toLocaleString('en-IN')}`}
                    icon={<Smartphone className="size-4 text-white" />}
                    accentBg="bg-violet-500"
                    textColor="text-violet-600"
                  />
                  <SummaryCard
                    label="Card Payment"
                    value={`₹${dailyData.summary.cardTotal.toLocaleString('en-IN')}`}
                    icon={<CreditCard className="size-4 text-white" />}
                    accentBg="bg-blue-500"
                    textColor="text-blue-600"
                  />
                </div>

                {/* Orders list */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="text-base font-semibold text-slate-800">Orders List</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Order No</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Worker</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dailyData.orders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                              No orders placed on this date
                            </td>
                          </tr>
                        ) : (
                          dailyData.orders.map((order: Order) => (
                            <tr key={order._id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-semibold text-slate-900">{order.orderNumber}</td>
                              <td className="px-5 py-3.5 text-slate-500">
                                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-5 py-3.5 font-medium text-slate-700">{order.workerId?.name || 'Unknown'}</td>
                              <td className="px-5 py-3.5 text-slate-600">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </td>
                              <td className="px-5 py-3.5 font-semibold text-slate-900">₹{order.total.toLocaleString('en-IN')}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider shadow-sm ${paymentMethodBadges[order.paymentMethod]}`}>
                                  {order.paymentMethod}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Monthly Report Tab */}
          <TabsContent value="monthly" className="space-y-6 outline-none">
            {/* Selectors */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Select Month:</span>
              <select
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(parseInt(e.target.value))}
                className="h-9 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={monthlyYear}
                onChange={(e) => setMonthlyYear(parseInt(e.target.value))}
                className="h-9 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Error state */}
            {monthlyError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {monthlyError}
              </div>
            )}

            {/* Loading */}
            {monthlyLoading && <ReportSkeleton />}

            {/* Monthly Loaded Data */}
            {!monthlyLoading && monthlyData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <SummaryCard
                    label="Monthly Revenue"
                    value={`₹${monthlyData.summary.totalRevenue.toLocaleString('en-IN')}`}
                    icon={<IndianRupee className="size-4 text-white" />}
                    accentBg="bg-amber-500"
                    textColor="text-amber-600"
                  />
                  <SummaryCard
                    label="Total Orders"
                    value={monthlyData.summary.totalOrders.toString()}
                    icon={<ShoppingBag className="size-4 text-white" />}
                    accentBg="bg-slate-700"
                    textColor="text-slate-900"
                  />
                  <SummaryCard
                    label="Cash Payment"
                    value={`₹${monthlyData.summary.cashTotal.toLocaleString('en-IN')}`}
                    icon={<Banknote className="size-4 text-white" />}
                    accentBg="bg-emerald-500"
                    textColor="text-emerald-600"
                  />
                  <SummaryCard
                    label="UPI Payment"
                    value={`₹${monthlyData.summary.upiTotal.toLocaleString('en-IN')}`}
                    icon={<Smartphone className="size-4 text-white" />}
                    accentBg="bg-violet-500"
                    textColor="text-violet-600"
                  />
                  <SummaryCard
                    label="Card Payment"
                    value={`₹${monthlyData.summary.cardTotal.toLocaleString('en-IN')}`}
                    icon={<CreditCard className="size-4 text-white" />}
                    accentBg="bg-blue-500"
                    textColor="text-blue-600"
                  />
                </div>

                {/* Daily stats breakdown list */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="text-base font-semibold text-slate-800">Daily breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cash Sales</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">UPI Sales</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Card Sales</th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {monthlyData.dailyStats.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                              No sales recorded for this month
                            </td>
                          </tr>
                        ) : (
                          monthlyData.dailyStats.map((day) => (
                            <tr key={day._id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-medium text-slate-900">
                                {new Date(day._id).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-5 py-3.5 text-slate-600">{day.orders} orders</td>
                              <td className="px-5 py-3.5 text-emerald-600 font-medium">₹{day.cash.toLocaleString('en-IN')}</td>
                              <td className="px-5 py-3.5 text-violet-600 font-medium">₹{day.upi.toLocaleString('en-IN')}</td>
                              <td className="px-5 py-3.5 text-blue-600 font-medium">₹{day.card.toLocaleString('en-IN')}</td>
                              <td className="px-5 py-3.5 font-bold text-slate-900">₹{day.revenue.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
