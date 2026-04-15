export type Role = 'PASSENGER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
export type BusType = 'STANDARD' | 'VIP' | 'SLEEPER';
export type TripStatus = 'SCHEDULED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
export type BoostPackage = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo?: string;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface Bus {
  id: string;
  companyId: string;
  plateNumber: string;
  type: BusType;
  capacity: number;
  amenities?: { wifi?: boolean; ac?: boolean; usb?: boolean; toilet?: boolean };
  isActive: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  companyId: string;
  busId: string;
  bus?: { type: BusType; plateNumber?: string };
  company?: { name: string; logo?: string };
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  price: number;
  availableSeats: number;
  status: TripStatus;
  isBoosted: boolean;
  boostExpiresAt?: string;
  createdAt: string;
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  companyId: string;
  seatsCount: number;
  seatNumbers?: string[];
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  user?: { name: string; email: string; phone?: string };
  trip?: { origin: string; destination: string; departureAt: string };
  payment?: { status: PaymentStatus; amount: number };
}

export interface Payment {
  id: string;
  bookingId: string;
  companyId: string;
  userId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  user?: { name: string; email: string };
  booking?: { trip?: { origin: string; destination: string } };
}

export interface CommissionReport {
  totalTransactions: number;
  totalAmount: number;
  totalCommission: number;
  totalNetPaidToCompanies: number;
  byCompany: Array<{
    companyId: string;
    _sum: { commissionAmount: number; netAmount: number; amount: number };
  }>;
}

export interface CompanyStats {
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
}

export interface CreateBusDto {
  plateNumber: string;
  type: BusType;
  capacity: number;
  amenities?: Record<string, boolean>;
}

export interface CreateTripDto {
  busId: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  price: number;
  availableSeats: number;
}

export interface CreateBoostDto {
  tripId: string;
  package: BoostPackage;
}
