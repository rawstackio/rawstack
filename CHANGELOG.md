# 🧾 Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v0.1.0-alpha.1] - 2025-10-24
### 🚀 Overview
Initial **alpha release** of the **RawStack API Core** — the first component of the RawStack platform.  
This marks the starting point for the open-source backend foundation of the RawStack ecosystem.

Built with **NestJS**, **Prisma**, and **Zod**, the API implements principles of **Domain-Driven Design (DDD)** and **Command Query Responsibility Segregation (CQRS)** to provide a solid, extensible architecture for scalable, self-hosted applications.

### ✨ Added
- **API Core** (NestJS + Prisma) initial release
- **CQRS and DDD structure** for command/query separation
- **JWT-based authentication** and **Argon2 password hashing**
- **Redis integration** for caching and pub/sub
- **Zod** validation pipeline for input schemas
- **CLI (Nest Commander)** for migrations and admin utilities
- **Environment configuration** via `.env` and `@nestjs/config`
- **Initial Jest test suite** for unit and e2e testing
- **Docker and Prisma setup** for local development

### 🧱 Scope
Included in this release:
- `apps/api` — RawStack API Core

Planned for future alphas:
- `apps/app` — Mobile application
- `infra/` — Deployment & infrastructure
- `apps/web` — React + Vite frontend
- `apps/admin` — Admin dashboard

### ⚙️ Notes
This is an **alpha** release intended for preview and testing.  
Expect active iteration and breaking changes before the first stable release (`v0.1.0`).

### 🔗 Resources
- Website: [https://rawstack.io](https://rawstack.io)
- Repository: [https://github.com/rawstackio/rawstack](https://github.com/rawstackio/rawstack)
- Contact: [hello@rawstack.io](mailto:hello@rawstack.io)

## [v0.1.0-alpha.2] - 2025-11-07
### 🚀 Overview
This alpha introduces the **RawStack Mobile App**, built with **React Native**.  
It provides the starting point for the mobile experience of the RawStack platform and integrates with the RawStack API Core.

The focus of this release is establishing UI foundations, navigation structure, API connectivity, and shared design primitives.

### ✨ Added
- **React Native mobile app** (`apps/app`)
- **App bootstrapping, navigation layout**, and core UI structure
- **API client integration** with the RawStack API Core
- **Shared auth/session handling** foundation
- Development environment instructions for iOS/Android

### 🧱 Scope
Included in this release:
- `apps/app` — RawStack Mobile App
- `apps/api` — RawStack API Core (unchanged)

Coming in future alphas:
- `infra/` — Deployment & cluster configuration
- `apps/web` — User-facing web application
- `apps/admin` — Administration dashboard

### ⚙️ Notes
This is a **mobile alpha**. Expect UI iteration and architectural refinement as features expand.

For setup instructions, see `apps/app/README.md`.

## [v0.1.0-alpha.3] - 2026-01-09
### 🚀 Overview
This alpha expands the RawStack platform beyond the API and mobile app by introducing **API versioning**, the initial **Admin Dashboard**, and the **public website**.

The focus of this release is platform structure and lifecycle concerns — establishing versioned APIs, administrative interfaces, and a public-facing web presence to support real-world usage and future growth.

### ✨ Added
- **API versioning** support in the RawStack API Core
    - Versioned routing and structure to support backward compatibility
- **Admin dashboard** (`apps/admin`)
    - Initial layout and navigation
    - Foundation for managing users
- **Public website** (`apps/web`)
    - User flows
### 🧱 Scope
Included in this release:
- `apps/api` — RawStack API Core (with versioning)
- `apps/app` — RawStack Mobile App
- `apps/admin` — Admin Dashboard *(new)*
- `apps/web` — Public Website *(new)*

Coming in future alphas:
- `infra/` — Deployment & infrastructure configuration
- Expanded admin and web functionality

### ⚙️ Notes
This is a **platform alpha**.  
API versioning is expected to evolve, and both the admin dashboard and website are early foundations that will be iterated on significantly in upcoming releases.

For setup instructions, see:
- `apps/api/README.md`
- `apps/admin/README.md`
- `apps/web/README.md`

## [v0.1.0-alpha.4] - 2026-01-23
### 🚀 Overview
This alpha introduces the **Infrastructure as Code (IaC)** foundation for the RawStack platform using **AWS CDK**.  
The focus of this release is deployment automation — enabling reproducible, scalable cloud infrastructure for the RawStack API.

### ✨ Added
- **Core Stack** (`infrastructure/core-stack`) — AWS CDK infrastructure
    - VPC with public and private subnets
    - RDS PostgreSQL database with secure credentials in Secrets Manager
    - ElastiCache Redis cluster for caching and pub/sub
    - ECS Fargate cluster with Application Load Balancer
    - ECR integration for container images
    - Auto-scaling based on CPU and memory utilization
    - Automatic deployment on ECR image push via Lambda + EventBridge
    - Secure networking and IAM roles
- **ECR Push Script** (`scripts/push-api-to-ecr.sh`)
    - Build and push Docker images to AWS ECR
    - Automatic ECR repository creation if not exists
    - Environment-based configuration via `.env`
- **API Core** minor improvements and tweaks

### 🧱 Scope
Included in this release:
- `infrastructure/core-stack` — AWS CDK Infrastructure *(new)*
- `scripts/push-api-to-ecr.sh` — ECR deployment script *(new)*
- `apps/api` — RawStack API Core (minor updates)
- `apps/app` — RawStack Mobile App
- `apps/admin` — Admin Dashboard
- `apps/web` — Public Website

### ⚙️ Notes
This is an **infrastructure alpha**.  
The CDK stack is designed for development and testing environments. Production configurations (multi-AZ, enhanced security, deletion protection) should be enabled before deploying to production.

For setup instructions, see:
- `infrastructure/core-stack/README.md`
- `apps/api/README.md`

## [v0.1.0-alpha.5] - 2026-01-31
### 🚀 Overview
This alpha introduces the **Admin Infrastructure Stack** using **AWS CDK**, along with bug fixes and refactoring across the API and Admin Dashboard.

The focus of this release is extending infrastructure automation for the admin dashboard deployment, improving code quality through refactoring, and resolving bugs discovered during development.

### ✨ Added
- **Admin Stack** (`infrastructure/admin-stack`) — AWS CDK infrastructure for Admin Dashboard
    - S3 bucket for static hosting
    - CloudFront distribution for CDN and HTTPS
    - Route 53 integration for custom domain support
    - Automated deployment pipeline

### 🐛 Fixed
- **API Core** bug fixes
    - Resolved issues with user role management
    - Fixed array equality comparison in domain models
- **Admin Dashboard** bug fixes and improvements
    - Fixed password update flow
    - Resolved form validation issues

### ♻️ Refactored
- **Admin Dashboard** code improvements
    - Extracted API mutations into custom hooks (`useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useGetUser`)
    - Extracted password mutations into custom hooks (`useUpdatePassword`, `usePasswordResetRequest`)
    - Decoupled UI components from API and storage layer
    - Improved separation of concerns following consistent hook patterns

### 🧱 Scope
Included in this release:
- `infrastructure/admin-stack` — AWS CDK Admin Infrastructure *(new)*
- `apps/api` — RawStack API Core (bug fixes)
- `apps/admin` — Admin Dashboard (refactoring + bug fixes)
- `apps/app` — RawStack Mobile App
- `apps/web` — Public Website
- `infrastructure/core-stack` — AWS CDK Core Infrastructure

### ⚙️ Notes
This is a **maintenance and infrastructure alpha**.  
The admin stack follows the same CDK patterns established in the core stack. Custom hooks in the admin dashboard provide better testability and maintainability.

For setup instructions, see:
- `infrastructure/admin-stack/README.md`
- `infrastructure/core-stack/README.md`
- `apps/api/README.md`
- `apps/admin/README.md`
