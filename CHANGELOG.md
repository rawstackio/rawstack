# 🧾 Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v0.1.0-beta.2] - 2026-04-14
### 🐛 Fixed
- **Prisma client module resolution** (`apps/api`)
    - Updated Prisma client imports to use `@generated/prisma` custom module path
    - Added Jest `moduleNameMapper` configuration for test compatibility
    - Updated TypeScript path mappings in `tsconfig.json`

---

## [v0.1.0-beta.1] - 2026-04-09
### 🚀 Overview
This is the **first beta release** of the RawStack platform, introducing **CLI infrastructure improvements** in the API, **dependency updates**, **design token enhancements**, and **app refactoring** for better modularity and user experience.

The focus of this release is establishing a robust CLI architecture for the API, improving theming flexibility across applications, and enhancing code maintainability through refactoring.

### ✨ Added
- **CLI Infrastructure** (`apps/api`)
    - New CLI entrypoint (`rawstack` script) using `nest-commander`
    - Added `commander` dependency for CLI support
    - Implemented `CliModule` with necessary imports and providers for structured CLI commands
- **Abstract `BaseCommandRunner` class** (`apps/api`)
    - Provides consistent context (`requestId`, `actor`) for CLI command runners
    - Standardized error handling and improved code reuse across CLI commands
- **Brand color design tokens** (`apps/admin`, `apps/web`)
    - New CSS variables for primary/secondary brand colors and their foregrounds
    - Support for both light and dark themes
    - Improved design consistency and theming flexibility

### ♻️ Refactored
- **`CreateUserCommand`** (`apps/api`)
    - Extended from `BaseCommandRunner` and moved logic from `run` to `execute`
    - Aligned with the new CLI architecture patterns
- **Email verification notification** (`apps/app`)
    - Extracted into a reusable `EmailVerificationNotification` component
    - Simplified logic in `SettingsScreen` for improved maintainability

### ⬆️ Updated
- **Dependency upgrades** (`apps/admin`)
    - `lucide-react`, `zod`, `@types/node`, `@vitejs/plugin-react`, `jsdom`, `typescript`, `vite`
    - Ensures compatibility and access to new features and fixes

### 🧱 Scope
Included in this release:
- `apps/api` — RawStack API Core (CLI infrastructure)
- `apps/admin` — Admin Dashboard (dependency updates, theming)
- `apps/web` — Public Website (theming)
- `apps/app` — RawStack Mobile App (email verification refactor)
- `infrastructure/aws` — AWS CDK infrastructure
- `services/notification` — Notification Microservice

### ⚙️ Notes
This is the **first beta release**, marking a transition from alpha to a more stable API surface.
The new CLI infrastructure establishes patterns for administrative commands that will be expanded in future releases. Design token improvements provide a foundation for consistent theming across all applications.

For setup instructions, see:
- `apps/api/README.md`
- `apps/admin/README.md`
- `apps/app/README.md`

## [v0.1.0-alpha.8] - 2026-03-20
### 🚀 Overview
This alpha introduces **end-to-end (E2E) testing infrastructure** using **Playwright** for the Admin Dashboard and Public Website, along with significant **accessibility**, **form validation**, and **user experience** improvements.

The focus of this release is establishing automated E2E testing patterns, improving accessibility across UI components, enhancing form validation feedback, and ensuring proper authentication state handling.

### ✨ Added
- **Playwright E2E testing infrastructure** for `apps/admin` and `apps/web`
    - Added Playwright as a dev dependency with `playwright.config.ts` configuration
    - Introduced test scripts and MCP server config for running Playwright tests
- **Extensive Playwright E2E tests**
    - Verifies UI behavior for login, logout, password reset, and authentication state handling

### 🧱 Scope
Included in this release:
- `apps/admin` — Admin Dashboard (E2E testing, accessibility, form validation)
- `apps/web` — Public Website (E2E testing infrastructure)
- `apps/api` — RawStack API Core
- `apps/app` — RawStack Mobile App
- `infrastructure/aws` — AWS CDK infrastructure
- `services/notification` — Notification Microservice

### ⚙️ Notes
This is a **testing and DX-focused alpha**.
The Playwright E2E testing infrastructure establishes patterns for automated UI testing that will be expanded in future releases. Accessibility improvements follow WCAG guidelines and enhance usability for screen reader users.

For setup instructions, see:
- `apps/admin/README.md`
- `apps/web/README.md`

## [v0.1.0-alpha.7] - 2026-02-26
### 🚀 Overview
This alpha focuses on **code quality improvements** and **developer experience enhancements** across the Admin Dashboard and Mobile App, along with backend bug fixes and Docker setup improvements.

The focus of this release is reducing boilerplate, standardizing mutation patterns, improving authentication flows, and enhancing local development tooling.

### ✨ Added
- **Reusable mutation hook** (`useMutationWithCallbacks`) in the Admin Dashboard
    - Standardizes mutation handling across the application
    - Reduces boilerplate for success/error callbacks
- **React Query integration** in the Mobile App
    - Added `@tanstack/react-query` dependency
    - Wrapped app with `QueryProvider` to enable query/mutation support

### ♻️ Refactored
- **Admin Dashboard** mutation hooks
    - Refactored password, user creation, user update, and user deletion hooks to use `useMutationWithCallbacks`
    - Simplified APIs and callback handling across all mutation hooks
- **Mobile App** authentication forms
    - Updated `LoginForm`, `SignupForm`, and `PasswordResetRequestForm` to use new hooks (`useLogin`, `useRegister`, `useCreatePasswordResetRequest`)
    - Simplified form props and error handling
    - Removed legacy callback and state logic in favor of hook-driven approaches
- **Infrastructure organization**
    - Consolidated AWS CDK stacks into unified `infrastructure/aws` directory
    - Updated documentation and deployment commands

### 🐛 Fixed
- **API Core** bug fixes
    - Fixed token lookup to ignore deleted users in `TokenRepositoryPrisma`
    - Improved email update logic in `UpdateUserService` to handle cases where the unverified email matches the requested email

### 🛠️ Improved
- **Docker Compose** setup for the API
    - Added persistent volumes for local development
    - Added health checks for improved container reliability
    - Updated test database configuration

### 🧱 Scope
Included in this release:
- `apps/admin` — Admin Dashboard (mutation hook refactoring)
- `apps/app` — RawStack Mobile App (auth forms + React Query)
- `apps/api` — RawStack API Core (bug fixes)
- `infrastructure/aws` — AWS CDK infrastructure (documentation updates)

### ⚙️ Notes
This is a **maintenance and DX-focused alpha**.
The new `useMutationWithCallbacks` hook establishes a consistent pattern for handling mutations that can be adopted across the platform. The React Query integration in the mobile app aligns it with the admin dashboard patterns.

For setup instructions, see:
- `apps/admin/README.md`
- `apps/app/README.md`
- `apps/api/README.md`

## [v0.1.0-alpha.6] - 2026-02-11
### 🚀 Overview
This alpha introduces the **Web Infrastructure Stack** using **AWS CDK** and the **Notification Microservice** — the first standalone microservice in the RawStack platform.

The focus of this release is extending infrastructure automation for the public website deployment and establishing the foundation for event-driven microservices architecture.

### ✨ Added
- **Unified AWS CDK app** (`infrastructure/aws`) — consolidated infrastructure codebase for all stacks
- **Web Stack** (`infrastructure/aws`) — AWS CDK infrastructure for Public Website
    - ECS Fargate service behind an Application Load Balancer
    - CloudFront distribution for CDN and HTTPS
    - ECR integration for container images
    - Automated deployment on ECR image push via Lambda + EventBridge
- **Notification Microservice** (`services/notification`) — Event-driven notification service
    - Email, push, and in-app notification support
    - React email for email rendering

### 🧱 Scope
Included in this release:
- `infrastructure/aws` — AWS CDK infrastructure (Core, Web, Admin) *(unified structure)*
- `scripts/push-web-to-ecr.sh` — Web ECR push script *(new)*
- `services/notification` — Notification Microservice *(new)*
- `apps/api` — RawStack API Core
- `apps/admin` — Admin Dashboard
- `apps/app` — RawStack Mobile App
- `apps/web` — Public Website

### ⚙️ Notes
This is an **infrastructure and services alpha**.
The stacks are now managed under a single CDK app in `infrastructure/aws` with a shared `.env` file. The notification microservice introduces the first event-driven service, setting patterns for future microservices.

For setup instructions, see:
- `infrastructure/aws/README.md`
- `services/notification/README.md`
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
