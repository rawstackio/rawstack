import { PrismaClient, Roles } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon from 'argon2';
import { randomUUID } from 'crypto';

const dbSsl = (process.env.DB_SSL ?? '').toLowerCase();
const useSsl = dbSsl === 'true' || dbSsl === '1' || dbSsl === 'require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding test database...');

  // Create admin user
  const adminPassword = await argon.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@test.com',
      hash: adminPassword,
      roles: [Roles.ADMIN, Roles.VERIFIED_USER],
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create regular user
  const userPassword = await argon.hash('password1');
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'user@test.com',
      hash: userPassword,
      roles: [Roles.VERIFIED_USER],
    },
  });
  console.log(`✅ Regular user created: ${user.email}`);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
