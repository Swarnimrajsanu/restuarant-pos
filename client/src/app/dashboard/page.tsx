'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats, DailyChartData, PaymentChartData } from '@/types';
import {
  IndianRupee,
  ShoppingBag,
  Banknote,
  Smartphone,
  CreditCard,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Stat Card Component ────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string; // Tailwind bg class for the icon container
  textColor: string;   // Tailwind text class for the value
}

function StatCard({ label, value, icon, accentColor, textColor }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`text-2xl font-bold tracking-tight ${textColor}`}>{value}</p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${accentColor} shadow-sm`}>
          {icon}
        </div>
      </div>
      {/* Decorative accent bar */}
      <div className={`absolute bottom-0 left-0 h-1 w-full ${accentColor} opacity-60`} />
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
              <Skeleton className="size-11 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <Skeleton className="mb-6 h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6">
          <Skeleton className="mb-6 h-5 w-48" />
          <div className="flex items-center justify-center">
            <Skeleton className="size-56 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bar Chart Component (CSS-based) ────────────────────────────────────────
function BarChart({ data }: { data: DailyChartData[] }) {
  const [animated, setAnimated] = useState(false);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="size-5 text-amber-500" />
        <h3 className="text-base font-semibold text-slate-900">Last 7 Days Sales</h3>
      </div>

      {/* Chart container */}
      <div className="flex items-end gap-2 sm:gap-3" style={{ height: 220 }}>
        {data.map((day, index) => {
          const heightPercent = (day.revenue / maxRevenue) * 100;
          return (
            <div key={index} className="group flex flex-1 flex-col items-center gap-2">
              {/* Revenue value tooltip */}
              <div className="text-[10px] font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
                ₹{day.revenue.toLocaleString('en-IN')}
              </div>
              {/* Bar */}
              <div className="relative w-full flex-1">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-700 ease-out group-hover:from-amber-600 group-hover:to-amber-500"
                  style={{
                    height: animated ? `${Math.max(heightPercent, 4)}%` : '4%',
                    transitionDelay: `${index * 80}ms`,
                  }}
                >
                  {/* Orders badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {day.orders} orders
                  </div>
                </div>
              </div>
              {/* Label */}
              <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Donut Chart Component (CSS conic-gradient) ─────────────────────────────
function DonutChart({ data }: { data: PaymentChartData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build conic-gradient segments
  let cumulative = 0;
  const segments = data.map((d) => {
    const start = cumulative;
    const angle = total > 0 ? (d.value / total) * 360 : 0;
    cumulative += angle;
    return { ...d, start, angle };
  });

  const gradientParts = segments.map(
    (s) => `${s.color} ${s.start}deg ${s.start + s.angle}deg`
  );

  // Fallback if no data
  const gradientValue =
    total > 0
      ? `conic-gradient(${gradientParts.join(', ')})`
      : 'conic-gradient(#e2e8f0 0deg 360deg)';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <CreditCard className="size-5 text-violet-500" />
        <h3 className="text-base font-semibold text-slate-900">Payment Distribution</h3>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <div
            className="size-48 rounded-full shadow-inner transition-all duration-700"
            style={{ background: gradientValue }}
          />
          {/* Center cutout */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-28 flex-col items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-lg font-bold text-slate-900">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {segments.map((segment, i) => {
            const percentage = total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="size-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{segment.name}</p>
                  <p className="text-xs text-slate-400">
                    ₹{segment.value.toLocaleString('en-IN')} ({percentage}%)
                    <span className="ml-1 text-slate-300">·</span>
                    <span className="ml-1">{segment.count} orders</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartDaily, setChartDaily] = useState<DailyChartData[]>([]);
  const [chartPayment, setChartPayment] = useState<PaymentChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, dailyData, paymentData] = await Promise.all([
        api.getDashboardStats(),
        api.getChartDaily(),
        api.getChartPayment(),
      ]);
      setStats(statsData);
      setChartDaily(dailyData);
      setChartPayment(paymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.name}! Here&apos;s today&apos;s overview.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="gap-2 self-start"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              onClick={fetchData}
              className="ml-2 font-medium text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <DashboardSkeleton />}

        {/* Loaded state */}
        {!loading && stats && (
          <div className="space-y-6">
            {/* Stat cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                label="Today's Revenue"
                value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                icon={<IndianRupee className="size-5 text-white" />}
                accentColor="bg-amber-500"
                textColor="text-amber-600"
              />
              <StatCard
                label="Total Orders"
                value={stats.totalOrders.toString()}
                icon={<ShoppingBag className="size-5 text-white" />}
                accentColor="bg-slate-700"
                textColor="text-slate-900"
              />
              <StatCard
                label="Cash Collection"
                value={`₹${stats.cashTotal.toLocaleString('en-IN')}`}
                icon={<Banknote className="size-5 text-white" />}
                accentColor="bg-emerald-500"
                textColor="text-emerald-600"
              />
              <StatCard
                label="UPI Collection"
                value={`₹${stats.upiTotal.toLocaleString('en-IN')}`}
                icon={<Smartphone className="size-5 text-white" />}
                accentColor="bg-violet-500"
                textColor="text-violet-600"
              />
              <StatCard
                label="Card Collection"
                value={`₹${stats.cardTotal.toLocaleString('en-IN')}`}
                icon={<CreditCard className="size-5 text-white" />}
                accentColor="bg-blue-500"
                textColor="text-blue-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {chartDaily.length > 0 ? (
                <BarChart data={chartDaily} />
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-10 text-sm text-slate-400">
                  No sales data available
                </div>
              )}
              {chartPayment.length > 0 ? (
                <DonutChart data={chartPayment} />
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-10 text-sm text-slate-400">
                  No payment data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
