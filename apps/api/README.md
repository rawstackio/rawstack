# 🛠️ RawStack API Core

**RawStack API Core** is the open-source backend foundation of the [RawStack](https://rawstack.io) platform — a modular, self-hosted application stack for building modern, scalable software systems.

The RawStack API is designed for **scalability, maintainability, and performance**.  
It follows **REST principles** and embraces concepts from **Domain-Driven Design (DDD)** and **Command Query Responsibility Segregation (CQRS)** to promote clear separation of concerns and well-structured business logic.

Built with [NestJS](https://nestjs.com), [Prisma](https://www.prisma.io/), and [Zod](https://zod.dev/), it provides a production-ready foundation for authentication, domain logic, and modular API design.

---

## 🧩 Architectural Principles

### CQRS (Command Query Responsibility Segregation)

**CQRS** separates **read** and **write** operations into distinct models.  
Instead of using the same data structures and logic for both retrieving and updating data, CQRS allows each side to be optimized independently — improving clarity, scalability, and performance.

In RawStack:

- **Commands** handle **writes** — creating, updating, or deleting data.
- **Queries** handle **reads** — fetching data without side effects.

This separation makes it easier to reason about system behavior, optimize for read-heavy or write-heavy workloads, and prepare for future extensions such as event sourcing.

### Domain-Driven Design (DDD)

**Domain-Driven Design** focuses on modeling software around the **core business domain** rather than technical details.  
It encourages a shared **Ubiquitous Language** between developers and domain experts, ensuring that software reflects real-world business processes and terminology.

Within RawStack, DDD principles guide how modules, aggregates, and services are structured — keeping business logic isolated, expressive, and easy to evolve.

---

## 🚀 Features

- ⚙️ **NestJS + Prisma** architecture — typed, modular, and extensible
- 🔐 **JWT-based authentication** with Argon2 password hashing
- 🧩 **CQRS pattern** for clean domain logic separation
- 🕒 **Day.js** utilities for date handling
- 🗄️ **Redis integration** for caching and pub/sub
- ✅ **Zod-based validation** for reliable schema enforcement
- 🧰 **CLI via Nest Commander** for migrations and admin tasks
- 🧪 **Jest test setup** ready out of the box

---

## 📦 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/rawstackiorawstack-api-core.git
cd rawstack-api-core
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment

Copy the example environment file and update variables as needed:
```bash
cp .env.example .env
```

Update values for your database, Redis, and JWT secret.

### 4️⃣ Generate Prisma client
```bash
npm run prisma:generate
```

### 5️⃣ Apply migrations
```bash
npm run prisma:migrate
```

### 6️⃣ Start development server
```bash
npm run start:dev
```

The API will be available at:
➡️ http://localhost:3000

### 🧪 Run Tests
```bash
npm test:unit
npm test:e2e
```

## 📄 License

This project is licensed under the [MIT License](./LICENSE).  
It includes open-source dependencies such as [NestJS](https://nestjs.com), [React](https://react.dev), and [Prisma](https://www.prisma.io/).

For more information, visit [rawstack.io](https://rawstack.io).
