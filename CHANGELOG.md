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


