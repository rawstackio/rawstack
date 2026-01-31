# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RawStack is a monorepo containing a modular, self-hosted application platform. It uses CQRS (Command Query Responsibility Segregation) and Domain-Driven Design principles.

## Repository Structure

```
apps/
├── api/          # NestJS + Prisma REST API backend (core)
├── web/          # Next.js public website
├── admin/        # React + Vite admin dashboard
└── app/          # React Native mobile app
infrastructure/
├── core-stack/   # AWS CDK for API (ECS, RDS, ElastiCache)
└── admin-stack/  # AWS CDK for admin (S3 + CloudFront)
packages/
└── api-client/   # Auto-generated TypeScript API client (shared)
scripts/
├── generate-api-client.sh  # OpenAPI spec → TypeScript client
└── push-api-to-ecr.sh      # Build and push Docker image to ECR
```

## Common Commands

### API (apps/api)
```bash
npm run dev                 # Run with Prisma migrations + watch mode
npm run build               # Build for production
npm run lint                # ESLint with --fix
npm run format              # Prettier
npm run test                # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests
```

Before running API tests, start test containers:
```bash
docker compose up -d db_test redis_test
```

### Web (apps/web)
```bash
npm run dev                 # Next.js dev with Turbopack
npm run build               # Production build
npm run lint                # ESLint
npm run test                # Vitest watch
npm run test:run            # Single run
```

### Admin (apps/admin)
```bash
npm run dev                 # Vite dev server
npm run build               # TypeScript + Vite build
npm run lint                # ESLint
npm run test                # Vitest watch
npm run test:run            # Single run
```

### Infrastructure
```bash
cd infrastructure/core-stack && npx cdk deploy   # Deploy API infrastructure
cd infrastructure/admin-stack && npx cdk deploy  # Deploy admin hosting
```

## Architecture

### API Module Structure (CQRS/DDD)

Each domain module follows this pattern:
```
src/<module>/
├── application/     # Use cases (commands/queries)
├── domain/          # Business logic, entities
└── infrastructure/  # Database adapters, external services
```

Commands handle writes (create, update, delete). Queries handle reads without side effects.

### Frontend → API Communication

All frontends (web, admin, mobile) consume the shared `@rawstack/api-client` package, which is auto-generated from the API's OpenAPI spec via `./scripts/generate-api-client.sh`.

### Authentication

JWT-based with Argon2 password hashing. Implemented via Passport.js in the auth module.

### Database

PostgreSQL with Prisma ORM. Schema at `apps/api/prisma/schema.prisma`. Run Prisma Studio with `npx prisma studio`.

### Caching

Redis via ioredis. Local development uses docker-compose; production uses AWS ElastiCache.

## Key Configuration Files

- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/docker-compose.yml` - Local PostgreSQL + Redis
- `apps/api/.env.dist` - API environment template
- `infrastructure/core-stack/.env.dist` - AWS deployment config
- `.prettierrc` - Shared formatting (single quotes, 2-space indent)
