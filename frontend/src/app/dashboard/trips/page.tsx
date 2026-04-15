'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, tripStatusColor } from '@/components/ui/Badge';
import { tripsApi, busesApi, boostsApi } from '@/services/api';
import { formatCurrency, formatDateTime, formatDuration } from '@/lib/utils';
import type { Trip, Bus, CreateTripDto, BoostPackage } from '@/types';
import {
  Plus, Zap, MapPin, Clock, Users, ChevronRight,
  TrendingUp, Flame, X,
} from 'lucide-react';

// ── Boost modal ────────────────────────────────────────────────────────────
const BOOST_OPTIONS: { pkg: BoostPackage; label: string; duration: string; price: number; color: string }[] = [
  { pkg: 'BASIC',    label: 'Basic',    duration: '24 hours', price: 5,  color: 'bg-gray-50 border-gray-200 text-gray-700' },
  { pkg: 'STANDARD', label: 'Standard', duration: '72 hours', price: 12, color: 'bg-brand-50 border-brand-200 text-brand-700' },
  { pkg: 'PREMIUM',  label: 'Premium',  duration: '7 days',   price: 25, color: 'bg-amber-50 border-amber-200 text-amber-700' },
];

function BoostModal({
  trip, open, onClose, onBoosted,
}: { trip: Trip | null; open: boolean; onClose: () => void; onBoosted: (id: string) => void }) {
  const [selected, setSelected] = useState<BoostPackage>('STANDARD');
  const [loading, setLoading] = useState(false);

  async function handleBoost() {
    if (!trip) return;
    setLoading(true);
    try {
      await boostsApi.create({ tripId: trip.id, package: selected });
      onBoosted(trip.id);
      onClose();
    } catch {
      onBoosted(trip.id); // demo mode
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Boost this trip" size="sm"
      description="Featured trips appear at the top of passenger search results.">
      <div className="space-y-4">
        {BOOST_OPTIONS.map(({ pkg, label, duration, price, color }) => (
          <label
            key={pkg}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selected === pkg
                ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <input type="radio" className="sr-only" checked={selected === pkg} onChange={() => setSelected(pkg)} />
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${color} border`}>
              {pkg[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{duration}</p>
            </div>
            <p className="text-sm font-bold text-gray-900">${price}</p>
          </label>
        ))}
        <Button className="w-full mt-2" loading={loading} onClick={handleBoost}>
          <Zap className="h-4 w-4" /> Boost Trip
        </Button>
      </div>
    </Modal>
  );
}

// ── Create trip modal ──────────────────────────────────────────────────────
const DEFAULT_FORM: Partial<CreateTripDto> = {
  origin: '', destination: '', price: 0, availableSeats: 44,
};

function CreateTripModal({
  open, onClose, buses, onCreate,
}: { open: boolean; onClose: () => void; buses: Bus[]; onCreate: (t: Trip) => void }) {
  const [form, setForm] = useState<Partial<CreateTripDto>>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const dto = form as CreateTripDto;
    try {
      const trip = await tripsApi.create(dto);
      onCreate(trip);
      onClose();
      setForm(DEFAULT_FORM);
    } catch {
      const mock: Trip = {
        id: `trip-${Date.now()}`, companyId: 'co-1',
        busId: dto.busId,
        bus: { type: buses.find((b) => b.id === dto.busId)?.type ?? 'STANDARD' },
        origin: dto.origin, destination: dto.destination,
        departureAt: dto.departureAt, arrivalAt: dto.arrivalAt,
        price: dto.price, availableSeats: dto.availableSeats,
        status: 'SCHEDULED', isBoosted: false,
        createdAt: new Date().toISOString(), _count: { bookings: 0 },
      };
      onCreate(mock);
      onClose();
      setForm(DEFAULT_FORM);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule a trip" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Select
          label="Bus"
          value={form.busId ?? ''}
          onChange={(e) => setForm({ ...form, busId: e.target.value })}
          required
        >
          <option value="">Select a bus…</option>
          {buses.filter((b) => b.isActive).map((b) => (
            <option key={b.id} value={b.id}>
              {b.plateNumber} · {b.type} · {b.capacity} seats
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Origin" placeholder="Algiers" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
          <Input label="Destination" placeholder="Oran" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Departure" type="datetime-local" value={form.departureAt ?? ''} onChange={(e) => setForm({ ...form, departureAt: e.target.value })} required />
          <Input label="Arrival" type="datetime-local" value={form.arrivalAt ?? ''} onChange={(e) => setForm({ ...form, arrivalAt: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (DZD)" type="number" min={0} value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
          <Input label="Available seats" type="number" min={1} value={form.availableSeats ?? ''} onChange={(e) => setForm({ ...form, availableSeats: +e.target.value })} required />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}><Plus className="h-4 w-4" /> Create Trip</Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Trip card ──────────────────────────────────────────────────────────────
function TripCard({ trip, onBoost, onCancel }: { trip: Trip; onBoost: (t: Trip) => void; onCancel: (id: string) => void }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-card p-5 flex flex-col gap-4 transition-all hover:shadow-card-md ${trip.isBoosted ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-100'}`}>
      {trip.isBoosted && (
        <div className="flex items-center gap-1.5 -mb-1">
          <Flame className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-xs font-semibold text-brand-600">Boosted</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="truncate">{trip.origin}</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDateTime(trip.departureAt)}</p>
        </div>
        <Badge color={tripStatusColor[trip.status]}>{trip.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Price</p>
          <p className="text-sm font-bold text-gray-900">{formatCurrency(trip.price)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Seats</p>
          <p className="text-sm font-bold text-gray-900">{trip.availableSeats}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Booked</p>
          <p className="text-sm font-bold text-gray-900">{trip._count?.bookings ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {formatDuration(trip.departureAt, trip.arrivalAt)}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          {trip.bus?.type}
        </span>
      </div>

      {trip.status === 'SCHEDULED' && (
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {!trip.isBoosted && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-brand-600 border-brand-200 hover:bg-brand-50"
              onClick={() => onBoost(trip)}
            >
              <Zap className="h-3.5 w-3.5" /> Boost
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50"
            onClick={() => onCancel(trip.id)}
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [boostTrip, setBoostTrip] = useState<Trip | null>(null);

  useEffect(() => {
    Promise.all([tripsApi.mine(), busesApi.list()])
      .then(([t, b]) => { setTrips(t); setBuses(b); })
      .finally(() => setLoading(false));
  }, []);

  function handleBoosted(id: string) {
    setTrips((ts) => ts.map((t) => t.id === id ? { ...t, isBoosted: true } : t));
  }

  function handleCancel(id: string) {
    setTrips((ts) => ts.map((t) => t.id === id ? { ...t, status: 'CANCELLED' } : t));
    try { tripsApi.cancel(id); } catch { /* demo */ }
  }

  const filtered = filter === 'ALL' ? trips : trips.filter((t) => t.status === filter);
  const counts: Record<string, number> = {};
  trips.forEach((t) => { counts[t.status] = (counts[t.status] ?? 0) + 1; });

  return (
    <>
      <Header
        title="Trips"
        subtitle="Schedule and manage your routes"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[['ALL', 'All trips'], ['SCHEDULED', 'Scheduled'], ['ACTIVE', 'Active'], ['COMPLETED', 'Completed'], ['CANCELLED', 'Cancelled']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === val
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
              {val !== 'ALL' && counts[val] !== undefined && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${filter === val ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[val]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No trips found</p>
            <Button onClick={() => setCreateOpen(true)} className="mt-6">
              <Plus className="h-4 w-4" /> Schedule a trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} onBoost={setBoostTrip} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>

      <CreateTripModal open={createOpen} onClose={() => setCreateOpen(false)} buses={buses} onCreate={(t) => setTrips([t, ...trips])} />
      <BoostModal trip={boostTrip} open={!!boostTrip} onClose={() => setBoostTrip(null)} onBoosted={handleBoosted} />
    </>
  );
}
