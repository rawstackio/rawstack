import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';

module.exports = async () => {
  // Force-load test env
  dotenv.config({ path: '.env.e2e', override: true });
  process.env.E2E = '1';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing in .env.e2e');
  }

  // Apply migrations to the fixed test DB
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });

  // keep client/types fresh
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  // (Optional) seed
  if (process.env.SEED_E2E === '1') {
    // adjust to your seeding approach if needed
    // execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
  }
};
