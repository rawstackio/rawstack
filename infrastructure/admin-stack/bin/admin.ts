#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { AdminStack } from '../lib/admin-stack';

const envPath = path.resolve(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  throw new Error('.env file is missing');
}

dotenv.config({ path: envPath });

const app = new cdk.App();
new AdminStack(app, 'admin-hosting', {
  env: {
    account: process.env.AWS_ACCOUNT_NO,
    region: process.env.AWS_REGION,
  },
});
