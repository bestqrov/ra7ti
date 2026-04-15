import type {
  AuthUser, Bus, Trip, Booking, Payment,
  CommissionReport, CompanyStats,
  CreateBusDto, CreateTripDto, CreateBoostDto,
} from '@/types';
import {
  MOCK_BUSES, MOCK_TRIPS, MOCK_BOOKINGS, MOCK_STATS,
} from '@/lib/mock-data';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function token() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ra7ti_token');
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const t = token();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    req<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Buses ─────────────────────────────────────────────────────────────────────
export const busesApi = {
  list: async (): Promise<Bus[]> => {
    try { return await req<Bus[]>('/buses'); }
    catch { return MOCK_BUSES; }
  },
  create: (dto: CreateBusDto): Promise<Bus> =>
    req<Bus>('/buses', { method: 'POST', body: JSON.stringify(dto) }),
  remove: (id: string) =>
    req(`/buses/${id}`, { method: 'DELETE' }),
};

// ── Trips ─────────────────────────────────────────────────────────────────────
export const tripsApi = {
  mine: async (): Promise<Trip[]> => {
    try { return await req<Trip[]>('/trips/company/mine'); }
    catch { return MOCK_TRIPS; }
  },
  search: async (params?: Record<string, string>): Promise<Trip[]> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    try {
      const res = await req<{ trips: Trip[] }>(`/trips${qs}`);
      return res.trips;
    } catch { return MOCK_TRIPS; }
  },
  create: (dto: CreateTripDto): Promise<Trip> =>
    req<Trip>('/trips', { method: 'POST', body: JSON.stringify(dto) }),
  cancel: (id: string) =>
    req(`/trips/${id}`, { method: 'DELETE' }),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingsApi = {
  list: async (): Promise<Booking[]> => {
    try { return await req<Booking[]>('/bookings'); }
    catch { return MOCK_BOOKINGS; }
  },
  cancel: (id: string) =>
    req(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: async (): Promise<Payment[]> => {
    try { return await req<Payment[]>('/payments'); }
    catch { return []; }
  },
  report: async (): Promise<CommissionReport> => {
    try { return await req<CommissionReport>('/payments/commission-report'); }
    catch {
      return {
        totalTransactions: 187,
        totalAmount: 284500,
        totalCommission: 15647,
        totalNetPaidToCompanies: 268853,
        byCompany: [],
      };
    }
  },
};

// ── Company ───────────────────────────────────────────────────────────────────
export const companyApi = {
  stats: async (): Promise<CompanyStats> => {
    try { return await req<CompanyStats>('/companies/my/stats'); }
    catch { return MOCK_STATS; }
  },
};

// ── Boosts ────────────────────────────────────────────────────────────────────
export const boostsApi = {
  create: (dto: CreateBoostDto) =>
    req('/boosts', { method: 'POST', body: JSON.stringify(dto) }),
  cancel: (id: string) =>
    req(`/boosts/${id}`, { method: 'DELETE' }),
};
