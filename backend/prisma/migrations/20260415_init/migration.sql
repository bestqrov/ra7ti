-- Ra7ti – Initial migration
-- Generated: 2026-04-15
-- Tables: users, companies, buses, trips, bookings, payments, boosts

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('PASSENGER', 'COMPANY_ADMIN', 'SUPER_ADMIN');
CREATE TYPE "BusType" AS ENUM ('STANDARD', 'VIP', 'SLEEPER');
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'CANCELLED', 'COMPLETED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
CREATE TYPE "BoostPackage" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
CREATE TYPE "BoostStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- ─────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────

CREATE TABLE "companies" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "phone"          TEXT NOT NULL,
    "logo"           TEXT,
    "description"    TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "phone"     TEXT,
    "role"      "Role" NOT NULL DEFAULT 'PASSENGER',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "buses" (
    "id"          TEXT NOT NULL,
    "companyId"   TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "type"        "BusType" NOT NULL DEFAULT 'STANDARD',
    "capacity"    INTEGER NOT NULL,
    "amenities"   JSONB,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trips" (
    "id"             TEXT NOT NULL,
    "companyId"      TEXT NOT NULL,
    "busId"          TEXT NOT NULL,
    "origin"         TEXT NOT NULL,
    "destination"    TEXT NOT NULL,
    "departureAt"    TIMESTAMP(3) NOT NULL,
    "arrivalAt"      TIMESTAMP(3) NOT NULL,
    "price"          DOUBLE PRECISION NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "status"         "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "isBoosted"      BOOLEAN NOT NULL DEFAULT false,
    "boostExpiresAt" TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookings" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "tripId"      TEXT NOT NULL,
    "companyId"   TEXT NOT NULL,
    "seatsCount"  INTEGER NOT NULL,
    "seatNumbers" JSONB,
    "totalPrice"  DOUBLE PRECISION NOT NULL,
    "status"      "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id"               TEXT NOT NULL,
    "bookingId"        TEXT NOT NULL,
    "companyId"        TEXT NOT NULL,
    "userId"           TEXT NOT NULL,
    "amount"           DOUBLE PRECISION NOT NULL,
    "commissionRate"   DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "netAmount"        DOUBLE PRECISION NOT NULL,
    "status"           "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod"    TEXT,
    "transactionId"    TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "boosts" (
    "id"        TEXT NOT NULL,
    "tripId"    TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "package"   "BoostPackage" NOT NULL,
    "price"     DOUBLE PRECISION NOT NULL,
    "startsAt"  TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status"    "BoostStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "boosts_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────
-- Unique constraints
-- ─────────────────────────────────────────────

CREATE UNIQUE INDEX "users_email_key"      ON "users"("email");
CREATE UNIQUE INDEX "companies_email_key"  ON "companies"("email");
CREATE UNIQUE INDEX "buses_plateNumber_key" ON "buses"("plateNumber");
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- ─────────────────────────────────────────────
-- Performance indexes (multi-tenant + search)
-- ─────────────────────────────────────────────

CREATE INDEX "users_companyId_idx"                      ON "users"("companyId");
CREATE INDEX "buses_companyId_idx"                      ON "buses"("companyId");
CREATE INDEX "trips_companyId_idx"                      ON "trips"("companyId");
CREATE INDEX "trips_origin_destination_departureAt_idx" ON "trips"("origin", "destination", "departureAt");
CREATE INDEX "trips_isBoosted_idx"                      ON "trips"("isBoosted");
CREATE INDEX "bookings_userId_idx"                      ON "bookings"("userId");
CREATE INDEX "bookings_tripId_idx"                      ON "bookings"("tripId");
CREATE INDEX "bookings_companyId_idx"                   ON "bookings"("companyId");
CREATE INDEX "payments_companyId_idx"                   ON "payments"("companyId");
CREATE INDEX "payments_userId_idx"                      ON "payments"("userId");
CREATE INDEX "boosts_tripId_idx"                        ON "boosts"("tripId");
CREATE INDEX "boosts_companyId_idx"                     ON "boosts"("companyId");

-- ─────────────────────────────────────────────
-- Foreign keys
-- ─────────────────────────────────────────────

ALTER TABLE "users"
    ADD CONSTRAINT "users_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "buses"
    ADD CONSTRAINT "buses_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trips"
    ADD CONSTRAINT "trips_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "trips"
    ADD CONSTRAINT "trips_busId_fkey"
    FOREIGN KEY ("busId") REFERENCES "buses"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_tripId_fkey"
    FOREIGN KEY ("tripId") REFERENCES "trips"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
    ADD CONSTRAINT "bookings_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
    ADD CONSTRAINT "payments_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
    ADD CONSTRAINT "payments_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
    ADD CONSTRAINT "payments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "boosts"
    ADD CONSTRAINT "boosts_tripId_fkey"
    FOREIGN KEY ("tripId") REFERENCES "trips"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "boosts"
    ADD CONSTRAINT "boosts_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
