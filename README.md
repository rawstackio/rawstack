# 🧱 RawStack

**Build on a solid foundation.**
~~Ship fast.~~ **Ship right. 🚀**

**RawStack** is a modular, self-hosted application platform for building modern, scalable software systems. It combines an open-source core with a growing suite of tools for APIs, web apps, mobile apps, infrastructure, and automation.

Built with a focus on **developer experience**, **domain-driven architecture**, and **extensibility**, RawStack provides everything you need to build and scale production-grade applications — without cutting corners.

> **Status:** Public beta — actively developed. See the [Changelog](./CHANGELOG.md) for release notes.

---

## 🧩 What's Included

| App / Package         | Path                      | Description                                           |
|-----------------------|---------------------------|-------------------------------------------------------|
| **Core API**          | `apps/api`                | NestJS + Prisma REST API. The backbone of the platform |
| **Web**               | `apps/web`                | Next.js public-facing website                          |
| **Admin Dashboard**   | `apps/admin`              | React + Vite internal admin frontend                  |
| **Mobile App**        | `apps/app`                | React Native mobile app                               |
| **API Client**        | `packages/api-client`     | Auto-generated TypeScript client (shared across apps) |
| **Notification Service** | `services/notification` | Standalone notification microservice                  |
| **Infrastructure**    | `infrastructure/aws`      | AWS CDK stacks for the full platform                  |

---

## 🛠 Tech Stack

### Backend
- **[NestJS](https://nestjs.com/)** — modular Node.js framework
- **[Prisma](https://www.prisma.io/)** — type-safe ORM with schema-first migrations
- **PostgreSQL** — primary relational database
- **Redis** — caching and session management via ioredis
- **Passport.js + JWT** — authentication with Argon2 password hashing

### Frontend
- **[Next.js](https://nextjs.org/)** (Turbopack) — public website
- **[React](https://react.dev/) + [Vite](https://vitejs.dev/)** — admin dashboard
- **[React Native](https://reactnative.dev/)** — iOS/Android mobile app

### Infrastructure
- **[AWS CDK](https://aws.amazon.com/cdk/)** (TypeScript) — infrastructure as code
- **ECS (Fargate)** — containerised API and web services
- **RDS (PostgreSQL)** — managed database
- **ElastiCache (Redis)** — managed cache
- **CloudFront + S3** — admin dashboard CDN
- **ALB** — load balancer for the API
- **ECR** — Docker image registry
- **Route 53 + ACM** — optional custom domains with HTTPS

---

## 🏗 Architecture

RawStack follows **CQRS** (Command Query Responsibility Segregation) and **Domain-Driven Design** principles throughout the API layer.

### Module Structure

Each domain module in `apps/api/src` is organised as:

```
src/<module>/
├── application/        # Use cases — commands (writes) and queries (reads)
├── domain/             # Business logic, entities, value objects
└── infrastructure/     # Database adapters, external service integrations
```

Commands handle all write operations (create, update, delete). Queries handle reads without side effects, keeping the two concerns cleanly separated.

### Shared API Client

All frontends (web, admin, mobile) consume the same `@rawstack/api-client` package. This client is auto-generated from the Core API's OpenAPI spec, ensuring the frontend and backend are always in sync:

```bash
./scripts/generate-api-client.sh
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 22
- Docker (for local PostgreSQL and Redis)
- Git

### Scaffold a New Project

The fastest way to get started is with the CLI installer:

```bash
npx create-rawstack-app@latest my-app
```

This clones the template, replaces project tokens, optionally installs dependencies, and initialises a fresh git repo.

### Manual Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/rawstackio/rawstack.git my-app
   cd my-app
   ```

2. **Start local services**
   ```bash
   cd apps/api
   docker compose up -d dev-db redis
   ```

3. **Configure the API**
   ```bash
   cp apps/api/.env.dist apps/api/.env
   # Edit apps/api/.env — set DATABASE_URL, JWT_SECRET, etc.
   ```

4. **Run the API**
   ```bash
   cd apps/api
   npm install
   npm run dev        # Runs Prisma migrations + starts in watch mode
   ```

5. **Run the web or admin frontend**
   ```bash
   cd apps/web        # or apps/admin
   npm install
   npm run dev
   ```

---

## 🧪 Testing

### API Tests

Start the test containers first:

```bash
cd apps/api
docker compose up -d db_test redis_test
```

Then run tests:

```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests (hits real DB)
npm run test:e2e           # End-to-end tests
npm run test               # All tests
```

### Frontend Tests

```bash
cd apps/web    # or apps/admin
npm run test:run
```

---

## ☁️ Infrastructure & Deployment

Infrastructure lives in `infrastructure/aws` and is managed with AWS CDK.

### Setup

```bash
cd infrastructure/aws
cp .env.dist .env
# Edit .env — set AWS_ACCOUNT_ID, AWS_REGION, ECR repo names, DB credentials, etc.
npm install
```

### Deploy

```bash
npx cdk deploy          # Deploy all stacks
npx cdk deploy CoreStack   # Deploy a single stack
```

### Stacks

| Stack          | Description                                              |
|----------------|----------------------------------------------------------|
| `CoreStack`    | ECS (API), RDS (PostgreSQL), ElastiCache (Redis), ALB   |
| `WebStack`     | ECS (Next.js), CloudFront                                |
| `AdminStack`   | S3 + CloudFront for the static admin build               |
| `DomainStack`  | Route 53 records + ACM certificates (optional)           |

### Docker Images

Build and push images to ECR before deploying:

```bash
./scripts/push-api-to-ecr.sh
./scripts/push-web-to-ecr.sh
```

---

## 📁 Repository Structure

```
apps/
├── api/          # NestJS + Prisma REST API (core)
├── web/          # Next.js public website
├── admin/        # React + Vite admin dashboard
└── app/          # React Native mobile app
infrastructure/
└── aws/          # Unified AWS CDK stacks
packages/
└── api-client/   # Auto-generated TypeScript API client
services/
└── notification/ # Notification microservice
scripts/
├── generate-api-client.sh   # OpenAPI spec → TypeScript client
├── push-api-to-ecr.sh       # Build and push API Docker image to ECR
└── push-web-to-ecr.sh       # Build and push web Docker image to ECR
```

---

## 🔐 Authentication

JWT-based authentication with short-lived access tokens and long-lived refresh tokens. Passwords are hashed with **Argon2**. Auth is implemented via **Passport.js** strategies in the `auth` module.

Token lifetimes are configurable via environment variables:

| Variable                        | Default  | Description                  |
|---------------------------------|----------|------------------------------|
| `ACCESS_TOKEN_TTL`              | 1200s    | Access token lifetime        |
| `REFRESH_TOKEN_TTL`             | 86400s   | Refresh token lifetime       |
| `EMAIL_VERIFICATION_TOKEN_TTL`  | 604800s  | Email verification link TTL  |
| `PASSWORD_RESET_TOKEN_TTL`      | 604800s  | Password reset link TTL      |

---

## 🗄 Database

Schema is defined in `apps/api/prisma/schema.prisma`. Use Prisma Studio to inspect data locally:

```bash
cd apps/api
npx prisma studio
```

---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of releases.

---

## 📄 License

[MIT](./LICENSE)

---

For more information, visit [rawstack.io](https://rawstack.io).
