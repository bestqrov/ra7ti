'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { paymentsApi } from '@/services/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { MOCK_ROUTE_STATS, MOCK_REVENUE_CHART } from '@/lib/mock-data';
import type { Payment, CommissionReport } from '@/types';
import { DollarSign, TrendingUp, CreditCard, Percent, ArrowUpRight } from 'lucide-react';

const RevenueBarChart = dynamic(
  () => import('@/components/charts/RevenueChart').then((m) => m.RevenueBarChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse bg-gray-100 rounded-xl" /> },
);

const RevenueAreaChart = dynamic(
  () => import('@/components/charts/RevenueChart').then((m) => m.RevenueAreaChart),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse bg-gray-100 rounded-xl" /> },
);

export default function RevenuePage() {
  const [report, setReport] = useState<CommissionReport | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([paymentsApi.report(), paymentsApi.list()])
      .then(([r, p]) => { setReport(r); setPayments(p.slice(0, 8)); })
      .finally(() => setLoading(false));
  }, []);

  const grossRevenue = report?.totalAmount ?? 0;
  const netRevenue = report?.totalNetPaidToCompanies ?? 0;
  const commission = report?.totalCommission ?? 0;
  const txCount = report?.totalTransactions ?? 0;

  return (
    <>
      <Header title="Revenue" subtitle="Financial analytics and commission breakdown" />

      <div className="flex-1 p-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Gross Revenue"
            value={formatCurrency(grossRevenue)}
            icon={<DollarSign className="h-5 w-5 text-brand-600" />}
            iconBg="bg-brand-50"
            change={{ value: '+18% vs last month', positive: true }}
          />
          <StatCard
            title="Net (After Commission)"
            value={formatCurrency(netRevenue)}
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            subtitle="paid to your account"
          />
          <StatCard
            title="Platform Commission"
            value={formatCurrency(commission)}
            icon={<Percent className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
            subtitle="5.5% avg rate"
          />
          <StatCard
            title="Transactions"
            value={txCount.toLocaleString()}
            icon={<CreditCard className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-50"
            change={{ value: '+9%', positive: true }}
            subtitle="completed payments"
          />
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Monthly Revenue Breakdown</h2>
              <p className="text-sm text-gray-400 mt-0.5">Gross revenue vs platform commission · 2025</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-brand-200" />
                <span className="text-xs text-gray-500">Commission</span>
              </div>
            </div>
          </div>
          <RevenueBarChart data={MOCK_REVENUE_CHART} />
        </div>

        {/* Commission breakdown + Top routes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Commission pane */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Commission Breakdown</h2>
            <p className="text-sm text-gray-400 mb-6">How each dirham is split</p>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 rounded-l-full"
                  style={{ width: `${grossRevenue ? (netRevenue / grossRevenue) * 100 : 94.5}%` }}
                />
                <div className="h-full bg-brand-400 flex-1 rounded-r-full" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Net Revenue (your share)', value: netRevenue, color: 'bg-emerald-400', pct: grossRevenue ? ((netRevenue / grossRevenue) * 100).toFixed(1) : '94.5' },
                { label: 'Platform Commission', value: commission, color: 'bg-brand-400', pct: grossRevenue ? ((commission / grossRevenue) * 100).toFixed(1) : '5.5' },
              ].map(({ label, value, color, pct }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(value)}</p>
                    <p className="text-xs text-gray-400">{pct}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Gross</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(grossRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Top routes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Revenue by Route</h2>
            <p className="text-sm text-gray-400 mb-6">Your top performing routes</p>

            <div className="space-y-5">
              {MOCK_ROUTE_STATS.map((r, i) => {
                const max = MOCK_ROUTE_STATS[0].revenue;
                const pct = (r.revenue / max) * 100;
                return (
                  <div key={r.route}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{r.route}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(r.revenue)}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{r.bookings} bookings · avg {formatCurrency(r.revenue / r.bookings)} per booking</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['Passenger', 'Route', 'Date', 'Gross', 'Commission', 'Net', 'Method', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                      No transactions yet
                    </td>
                  </tr>
                ) : payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.user?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.booking?.trip ? `${p.booking.trip.origin} → ${p.booking.trip.destination}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-sm text-amber-600">{formatCurrency(p.commissionAmount)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{formatCurrency(p.netAmount)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 capitalize">{p.paymentMethod ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge color={p.status === 'COMPLETED' ? 'green' : p.status === 'REFUNDED' ? 'orange' : 'yellow'} dot>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
