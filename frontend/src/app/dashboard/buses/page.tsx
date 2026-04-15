'use client';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge, busTypeColor } from '@/components/ui/Badge';
import { busesApi } from '@/services/api';
import type { Bus, BusType, CreateBusDto } from '@/types';
import {
  Plus, Bus as BusIcon, Wifi, Wind, Usb, Bath,
  MoreVertical, CheckCircle2, XCircle, Pencil, Trash2,
} from 'lucide-react';

function AmenityIcon({ active, icon: Icon, label }: { active?: boolean; icon: any; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs ${active ? 'text-brand-600' : 'text-gray-300'}`} title={label}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function BusCard({ bus, onDelete }: { bus: Bus; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col gap-4 hover:shadow-card-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <BusIcon className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{bus.plateNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{bus.capacity} seats</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36 text-sm">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 text-gray-700 hover:bg-gray-50">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => { onDelete(bus.id); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge color={busTypeColor[bus.type]}>{bus.type}</Badge>
        {bus.isActive
          ? <Badge color="green" dot>Active</Badge>
          : <Badge color="red" dot>Inactive</Badge>
        }
      </div>

      {/* Amenities */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
        <AmenityIcon active={bus.amenities?.wifi} icon={Wifi} label="WiFi" />
        <AmenityIcon active={bus.amenities?.ac} icon={Wind} label="AC" />
        <AmenityIcon active={bus.amenities?.usb} icon={Usb} label="USB" />
        <AmenityIcon active={bus.amenities?.toilet} icon={Bath} label="Toilet" />
        <span className="ml-auto text-xs text-gray-400">
          {Object.values(bus.amenities ?? {}).filter(Boolean).length} amenities
        </span>
      </div>
    </div>
  );
}

const DEFAULT_FORM: CreateBusDto = {
  plateNumber: '', type: 'STANDARD', capacity: 44,
  amenities: { wifi: false, ac: true, usb: false, toilet: false },
};

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateBusDto>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    busesApi.list().then(setBuses).finally(() => setLoading(false));
  }, []);

  function handleAmenity(key: string, val: boolean) {
    setForm((f) => ({ ...f, amenities: { ...f.amenities, [key]: val } }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const bus = await busesApi.create(form);
      setBuses((b) => [bus, ...b]);
      setModalOpen(false);
      setForm(DEFAULT_FORM);
    } catch (err: any) {
      // Demo: add mock bus
      const mock: Bus = {
        id: `bus-${Date.now()}`, companyId: 'co-1',
        ...form, isActive: true, createdAt: new Date().toISOString(),
      };
      setBuses((b) => [mock, ...b]);
      setModalOpen(false);
      setForm(DEFAULT_FORM);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setBuses((b) => b.filter((bus) => bus.id !== id));
    try { await busesApi.remove(id); } catch { /* demo */ }
  }

  const active = buses.filter((b) => b.isActive).length;
  const totalSeats = buses.reduce((s, b) => s + b.capacity, 0);

  return (
    <>
      <Header
        title="Buses"
        subtitle="Manage your company fleet"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Bus
          </Button>
        }
      />

      <div className="flex-1 p-8">
        {/* Summary bar */}
        <div className="flex gap-6 mb-8">
          {[
            { label: 'Total Buses', value: buses.length },
            { label: 'Active', value: active },
            { label: 'Inactive', value: buses.length - active },
            { label: 'Total Seats', value: totalSeats },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-card px-5 py-3.5">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : buses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <BusIcon className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No buses yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first bus to get started</p>
            <Button onClick={() => setModalOpen(true)} className="mt-6">
              <Plus className="h-4 w-4" /> Add Bus
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {buses.map((bus) => (
              <BusCard key={bus.id} bus={bus} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add a new bus"
        description="Register a vehicle to your fleet"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Plate number"
            placeholder="100-DZA-16"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Bus type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as BusType })}
            >
              <option value="STANDARD">Standard</option>
              <option value="VIP">VIP</option>
              <option value="SLEEPER">Sleeper</option>
            </Select>
            <Input
              label="Capacity (seats)"
              type="number"
              min={1}
              max={100}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: +e.target.value })}
              required
            />
          </div>

          {/* Amenities */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2.5">Amenities</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'wifi', label: 'WiFi', icon: Wifi },
                { key: 'ac', label: 'Air Conditioning', icon: Wind },
                { key: 'usb', label: 'USB Charging', icon: Usb },
                { key: 'toilet', label: 'Toilet', icon: Bath },
              ].map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    form.amenities?.[key as keyof typeof form.amenities]
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!form.amenities?.[key as keyof typeof form.amenities]}
                    onChange={(e) => handleAmenity(key, e.target.checked)}
                  />
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                  {form.amenities?.[key as keyof typeof form.amenities] && (
                    <CheckCircle2 className="h-4 w-4 ml-auto text-brand-500" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add Bus
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
