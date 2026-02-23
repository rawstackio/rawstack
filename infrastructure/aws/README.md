# RawStack Infrastructure

This directory contains the unified AWS CDK infrastructure for all RawStack stacks.

## Structure

- `bin/app.ts` - Main CDK app that instantiates all stacks
- `core-stack/` - Core infrastructure (VPC, RDS, Redis, API)
- `web-stack/` - Web application infrastructure (Next.js on ECS)
- `admin-stack/` - Admin dashboard infrastructure (S3 + CloudFront)

## Benefits of Unified CDK App

All three stacks live under the same CDK app, which provides:

1. **Easier cross-stack references** - Stacks can directly reference resources from other stacks
2. **Simplified dependency management** - Single `package.json` and `node_modules`
3. **Unified configuration** - Single `cdk.json` and `tsconfig.json`
4. **Better deployment orchestration** - Deploy all stacks with a single command
5. **Shared context** - All stacks share the same CDK context

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build the project:
```bash
npm run build
```

## Usage

### Deploy all stacks
```bash
npm run cdk deploy --all
```

### Deploy a specific stack
```bash
npm run cdk deploy core
npm run cdk deploy web
npm run cdk deploy admin-hosting
```

### Synth all stacks
```bash
npm run cdk synth
```

### Synth a specific stack
```bash
npm run cdk synth core
```

### Destroy stacks
```bash
npm run cdk destroy --all
```

## Stack Details

### Core Stack (`core`)
- VPC with public and private subnets
- RDS PostgreSQL database
- ElastiCache Redis cluster
- ECS Fargate cluster with API service
- Application Load Balancer

### Web Stack (`web`)
- ECS Fargate cluster for Next.js app
- Application Load Balancer
- CloudFront distribution
- Can import VPC from core-stack for shared networking

### Admin Stack (`admin-hosting`)
- S3 bucket for static hosting
- CloudFront distribution with OAC
- Automatic deployment from build artifacts

## Development

Watch mode for continuous compilation:
```bash
npm run watch
```
