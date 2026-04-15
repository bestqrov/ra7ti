/**
 * Seed: creates one super admin, one company + admin, two buses, and two trips.
 * Run: npm run prisma:seed
 */
import { PrismaClient, BusType, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Ra7ti database…');

  // ── Super Admin ──────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@ra7ti.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@ra7ti.com',
      password: await bcrypt.hash('Admin@1234', 12),
      role: Role.SUPER_ADMIN,
    },
  });
  console.log('✅ Super admin:', superAdmin.email);

  // ── Company ──────────────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { email: 'contact@ra7ti.com' },
    update: {},
    create: {
      name: 'Atlas Transport',
      email: 'contact@ra7ti.com',
      phone: '+212661000000',
      description: 'Leading transport company across Morocco',
      commissionRate: 5.5,
    },
  });
  console.log('✅ Company:', company.name);

  // ── Company Admin ────────────────────────────────────────────────────────
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'manager@ra7ti.com' },
    update: {},
    create: {
      name: 'Atlas Manager',
      email: 'manager@ra7ti.com',
      password: await bcrypt.hash('Manager@1234', 12),
      role: Role.COMPANY_ADMIN,
      companyId: company.id,
    },
  });
  console.log('✅ Company admin:', companyAdmin.email);

  // ── Passenger ────────────────────────────────────────────────────────────
  const passenger = await prisma.user.upsert({
    where: { email: 'passenger@ra7ti.com' },
    update: {},
    create: {
      name: 'Test Passenger',
      email: 'passenger@ra7ti.com',
      password: await bcrypt.hash('Passenger@1234', 12),
      role: Role.PASSENGER,
      phone: '+212660123456',
    },
  });
  console.log('✅ Passenger:', passenger.email);

  // ── Buses ────────────────────────────────────────────────────────────────
  const bus1 = await prisma.bus.upsert({
    where: { plateNumber: '100-DZA-16' },
    update: {},
    create: {
      companyId: company.id,
      plateNumber: '100-DZA-16',
      type: BusType.VIP,
      capacity: 44,
      amenities: { wifi: true, ac: true, usb: true, toilet: false },
    },
  });

  const bus2 = await prisma.bus.upsert({
    where: { plateNumber: '200-DZA-16' },
    update: {},
    create: {
      companyId: company.id,
      plateNumber: '200-DZA-16',
      type: BusType.STANDARD,
      capacity: 55,
      amenities: { wifi: false, ac: true, usb: false },
    },
  });
  console.log('✅ Buses created');

  // ── Trips ────────────────────────────────────────────────────────────────
  const departure1 = new Date('2025-07-10T07:00:00Z');
  const arrival1 = new Date('2025-07-10T11:00:00Z');
  const departure2 = new Date('2025-07-10T09:00:00Z');
  const arrival2 = new Date('2025-07-10T15:00:00Z');

  await prisma.trip.createMany({
    skipDuplicates: true,
    data: [
      {
        companyId: company.id,
        busId: bus1.id,
        origin: 'Algiers',
        destination: 'Oran',
        departureAt: departure1,
        arrivalAt: arrival1,
        price: 1200,
        availableSeats: 44,
        status: 'SCHEDULED',
      },
      {
        companyId: company.id,
        busId: bus2.id,
        origin: 'Algiers',
        destination: 'Constantine',
        departureAt: departure2,
        arrivalAt: arrival2,
        price: 900,
        availableSeats: 55,
        status: 'SCHEDULED',
      },
    ],
  });
  console.log('✅ Trips created');

  console.log('\n🎉 Seed complete!\n');
  console.log('Credentials:');
  console.log('  Super Admin  → admin@ra7ti.com      / Admin@1234');
  console.log('  Company Admin→ manager@ra7ti.com    / Manager@1234');
  console.log('  Passenger    → passenger@ra7ti.com  / Passenger@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
