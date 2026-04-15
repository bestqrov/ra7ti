'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Badge, bookingStatusColor, paymentStatusColor } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { bookingsApi } from '@/services/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import { CalendarCheck, Search, Filter, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

const STATUS_FILTERS: Array<{ value: BookingStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PAGE_SIZE = 10;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    bookingsApi.list().then(setBookings).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    const matchStatus = status === 'ALL' || b.status === status;
    const q = search.toLowerCase();
    const matchSearch = !q || b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.trip?.origin?.toLowerCase().includes(q) ||
      b.trip?.destination?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const revenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((s, b) => s + b.totalPrice, 0);

  async function handleCancel(id: string) {
    setBookings((bs) => bs.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    try { await bookingsApi.cancel(id); } catch { /* demo */ }
  }

  return (
    <>
      <Header
        title="Bookings"
        subtitle="Track and manage passenger reservations"
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: bookings.length, color: 'text-gray-900' },
            { label: 'Confirmed', value: bookings.filter((b) => b.status === 'CONFIRMED').length, color: 'text-emerald-600' },
            { label: 'Pending', value: bookings.filter((b) => b.status === 'PENDING').length, color: 'text-amber-600' },
            { label: 'Revenue', value: formatCurrency(revenue), color: 'text-brand-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-card px-5 py-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search passenger or route…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setStatus(value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  status === value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['Passenger', 'Route', 'Departure', 'Seats', 'Amount', 'Payment', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-400">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginated.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{b.user?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{b.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          {b.trip ? `${b.trip.origin} → ${b.trip.destination}` : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {b.trip ? formatDate(b.trip.departureAt) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">
                        {b.seatsCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        {b.payment && (
                          <Badge color={paymentStatusColor[b.payment.status]}>
                            {b.payment.status}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={bookingStatusColor[b.status]} dot>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
              <p className="text-sm text-gray-500">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {p}
                  </button>
                ))}
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
