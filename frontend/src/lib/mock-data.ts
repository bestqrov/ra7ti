import type { Bus, Trip, Booking, Payment, CompanyStats } from '@/types';

export const MOCK_BUSES: Bus[] = [
  {
    id: 'bus-1', companyId: 'co-1', plateNumber: '100-DZA-16',
    type: 'VIP', capacity: 44,
    amenities: { wifi: true, ac: true, usb: true, toilet: false },
    isActive: true, createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'bus-2', companyId: 'co-1', plateNumber: '200-DZA-16',
    type: 'STANDARD', capacity: 55,
    amenities: { wifi: false, ac: true, usb: false, toilet: false },
    isActive: true, createdAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'bus-3', companyId: 'co-1', plateNumber: '300-DZA-16',
    type: 'SLEEPER', capacity: 30,
    amenities: { wifi: true, ac: true, usb: true, toilet: true },
    isActive: false, createdAt: '2024-03-01T10:00:00Z',
  },
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-1', companyId: 'co-1', busId: 'bus-1',
    bus: { type: 'VIP', plateNumber: '100-DZA-16' },
    origin: 'Algiers', destination: 'Oran',
    departureAt: '2025-07-10T07:00:00Z', arrivalAt: '2025-07-10T11:00:00Z',
    price: 1200, availableSeats: 32, status: 'SCHEDULED',
    isBoosted: true, boostExpiresAt: '2025-07-09T07:00:00Z',
    createdAt: '2025-06-01T10:00:00Z', _count: { bookings: 12 },
  },
  {
    id: 'trip-2', companyId: 'co-1', busId: 'bus-2',
    bus: { type: 'STANDARD', plateNumber: '200-DZA-16' },
    origin: 'Algiers', destination: 'Constantine',
    departureAt: '2025-07-10T09:00:00Z', arrivalAt: '2025-07-10T15:00:00Z',
    price: 900, availableSeats: 48, status: 'SCHEDULED',
    isBoosted: false, createdAt: '2025-06-02T10:00:00Z', _count: { bookings: 7 },
  },
  {
    id: 'trip-3', companyId: 'co-1', busId: 'bus-3',
    bus: { type: 'SLEEPER', plateNumber: '300-DZA-16' },
    origin: 'Oran', destination: 'Annaba',
    departureAt: '2025-07-11T22:00:00Z', arrivalAt: '2025-07-12T06:00:00Z',
    price: 2500, availableSeats: 12, status: 'SCHEDULED',
    isBoosted: false, createdAt: '2025-06-03T10:00:00Z', _count: { bookings: 18 },
  },
  {
    id: 'trip-4', companyId: 'co-1', busId: 'bus-1',
    bus: { type: 'VIP', plateNumber: '100-DZA-16' },
    origin: 'Constantine', destination: 'Algiers',
    departureAt: '2025-07-08T06:00:00Z', arrivalAt: '2025-07-08T12:00:00Z',
    price: 1100, availableSeats: 0, status: 'COMPLETED',
    isBoosted: false, createdAt: '2025-06-01T10:00:00Z', _count: { bookings: 44 },
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-1', userId: 'u-1', tripId: 'trip-1', companyId: 'co-1',
    seatsCount: 2, totalPrice: 2400, status: 'CONFIRMED', createdAt: '2025-06-15T10:00:00Z',
    user: { name: 'Yacine Benali', email: 'yacine@example.com', phone: '+213661111111' },
    trip: { origin: 'Algiers', destination: 'Oran', departureAt: '2025-07-10T07:00:00Z' },
    payment: { status: 'COMPLETED', amount: 2400 },
  },
  {
    id: 'bk-2', userId: 'u-2', tripId: 'trip-2', companyId: 'co-1',
    seatsCount: 1, totalPrice: 900, status: 'CONFIRMED', createdAt: '2025-06-16T09:00:00Z',
    user: { name: 'Fatima Zahra', email: 'fatima@example.com' },
    trip: { origin: 'Algiers', destination: 'Constantine', departureAt: '2025-07-10T09:00:00Z' },
    payment: { status: 'COMPLETED', amount: 900 },
  },
  {
    id: 'bk-3', userId: 'u-3', tripId: 'trip-3', companyId: 'co-1',
    seatsCount: 3, totalPrice: 7500, status: 'PENDING', createdAt: '2025-06-17T14:00:00Z',
    user: { name: 'Karim Meziane', email: 'karim@example.com' },
    trip: { origin: 'Oran', destination: 'Annaba', departureAt: '2025-07-11T22:00:00Z' },
    payment: { status: 'PENDING', amount: 7500 },
  },
  {
    id: 'bk-4', userId: 'u-4', tripId: 'trip-1', companyId: 'co-1',
    seatsCount: 1, totalPrice: 1200, status: 'CANCELLED', createdAt: '2025-06-14T11:00:00Z',
    user: { name: 'Amina Khelifi', email: 'amina@example.com' },
    trip: { origin: 'Algiers', destination: 'Oran', departureAt: '2025-07-10T07:00:00Z' },
    payment: { status: 'REFUNDED', amount: 1200 },
  },
  {
    id: 'bk-5', userId: 'u-5', tripId: 'trip-4', companyId: 'co-1',
    seatsCount: 4, totalPrice: 4400, status: 'COMPLETED', createdAt: '2025-06-10T08:00:00Z',
    user: { name: 'Omar Touati', email: 'omar@example.com', phone: '+213660000002' },
    trip: { origin: 'Constantine', destination: 'Algiers', departureAt: '2025-07-08T06:00:00Z' },
    payment: { status: 'COMPLETED', amount: 4400 },
  },
  {
    id: 'bk-6', userId: 'u-6', tripId: 'trip-4', companyId: 'co-1',
    seatsCount: 2, totalPrice: 2200, status: 'COMPLETED', createdAt: '2025-06-11T10:00:00Z',
    user: { name: 'Nour Hadjadj', email: 'nour@example.com' },
    trip: { origin: 'Constantine', destination: 'Algiers', departureAt: '2025-07-08T06:00:00Z' },
    payment: { status: 'COMPLETED', amount: 2200 },
  },
];

export const MOCK_STATS: CompanyStats = {
  totalTrips: 24,
  totalBookings: 187,
  totalRevenue: 284500,
  totalCommission: 15647,
};

export const MOCK_REVENUE_CHART = [
  { month: 'Jan', revenue: 18200, commission: 1001 },
  { month: 'Feb', revenue: 24500, commission: 1347 },
  { month: 'Mar', revenue: 31000, commission: 1705 },
  { month: 'Apr', revenue: 28700, commission: 1578 },
  { month: 'May', revenue: 35400, commission: 1947 },
  { month: 'Jun', revenue: 42100, commission: 2315 },
  { month: 'Jul', revenue: 38900, commission: 2139 },
  { month: 'Aug', revenue: 46200, commission: 2541 },
  { month: 'Sep', revenue: 39800, commission: 2189 },
  { month: 'Oct', revenue: 0, commission: 0 },
  { month: 'Nov', revenue: 0, commission: 0 },
  { month: 'Dec', revenue: 0, commission: 0 },
];

export const MOCK_ROUTE_STATS = [
  { route: 'Algiers → Oran', bookings: 62, revenue: 74400 },
  { route: 'Algiers → Constantine', bookings: 48, revenue: 43200 },
  { route: 'Oran → Annaba', bookings: 35, revenue: 87500 },
  { route: 'Constantine → Algiers', bookings: 42, revenue: 46200 },
];
