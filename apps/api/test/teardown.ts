import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';

module.exports = async () => {
  dotenv.config({ path: '.env.e2e', override: true });

  if (process.env.RESET_E2E_DB_ON_TEARDOWN !== '1') return;

  // Wipes the test DB and reapplies migrations (no seed)
  execSync('npx prisma migrate reset --force --skip-seed', {
    stdio: 'inherit',
    env: process.env,
  });
};
