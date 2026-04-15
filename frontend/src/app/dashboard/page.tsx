'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, bookingStatusColor } from '@/components/ui/Badge';
import { companyApi, bookingsApi } from '@/services/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MOCK_ROUTE_STATS } from '@/lib/mock-data';
import type { CompanyStats, Booking } from '@/types';
import { DollarSign, Bus, CalendarCheck, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const RevenueBarChart = dynamic(
  () => import('@/components/charts/RevenueChart').then((m) => m.RevenueBarChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse bg-gray-100 rounded-xl" /> },
);

export default function DashboardPage() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([companyApi.stats(), bookingsApi.list()])
      .then(([s, b]) => { setStats(s); setBookings(b.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header
        title="Overview"
        subtitle={`Good ${getTimeGreeting()}, your platform is running smoothly.`}
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={stats ? formatCurrency(stats.totalRevenue) : '—'}
            icon={<DollarSign className="h-5 w-5 text-brand-600" />}
            iconBg="bg-brand-50"
            change={{ value: '+18% vs last month', positive: true }}
          />
          <StatCard
            title="Total Bookings"
            value={stats ? stats.totalBookings.toLocaleString() : '—'}
            icon={<CalendarCheck className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            change={{ value: '+12% vs last month', positive: true }}
          />
          <StatCard
            title="Active Trips"
            value={stats ? stats.totalTrips.toString() : '—'}
            icon={<Bus className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-50"
            subtitle="this month"
          />
          <StatCard
            title="Commission Paid"
            value={stats ? formatCurrency(stats.totalCommission) : '—'}
            icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
            change={{ value: '5.5% rate', positive: true }}
            subtitle="platform fee"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
                <p className="text-sm text-gray-400 mt-0.5">Monthly revenue vs commission — 2025</p>
              </div>
              <select className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
            <RevenueBarChart />
          </div>

          {/* Top routes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Top Routes</h2>
              <Link href="/dashboard/trips" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {MOCK_ROUTE_STATS.map((r, i) => {
                const max = MOCK_ROUTE_STATS[0].revenue;
                const pct = (r.revenue / max) * 100;
                return (
                  <div key={r.route}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{r.route}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{formatCurrency(r.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{r.bookings} bookings</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Passenger', 'Route', 'Date', 'Amount', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{b.user?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{b.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {b.trip ? `${b.trip.origin} → ${b.trip.destination}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {b.trip ? formatDate(b.trip.departureAt) : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(b.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={bookingStatusColor[b.status]} dot>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">No bookings yet</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
