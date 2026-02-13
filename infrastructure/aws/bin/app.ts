#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { CoreStack } from "../lib/core-stack";
import { WebStack } from "../lib/web-stack";
import { AdminStack } from "../lib/admin-stack";

// Load environment variables from .env file if it exists
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(
    "Warning: .env file not found at infrastructure/.env\n" +
    "Make sure to set required environment variables."
  );
}

// Create CDK app
const app = new cdk.App();

// Define AWS environment
const env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

// Core stack - provides VPC, database, and core API infrastructure
const coreStack = new CoreStack(app, "core", {
  env,
  description: "Core infrastructure stack with VPC, RDS, Redis, and API",
});

// Web stack - provides Next.js web application infrastructure
const webStack = new WebStack(app, "web", {
  env,
  vpc: coreStack.vpc,
  description: "Web application stack with ECS Fargate and CloudFront",
});

// Admin stack - provides admin dashboard hosting
const adminStack = new AdminStack(app, "admin-hosting", {
  env,
  description: "Admin dashboard static hosting with S3 and CloudFront",
});

