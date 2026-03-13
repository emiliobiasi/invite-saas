# Invite SaaS - Visão Geral

Este monorepo organiza os artefatos da aplicação em pacotes separados:

- `packages/be`: backend (Bun + Elysia)
- `packages/fe`: futuro frontend
- `docs`: documentação compartilhada (contexto geral, decisões de arquitetura, cloud e agente Claude)

## Comandos principais

Na raiz (usa Bun):

- `bun run be:dev` — inicia o backend em modo desenvolvimento
- `bun run be:lint` — lint do backend
- `bun run be:format` — formatador
- `bun run be:typecheck` — typecheck
- `bun run be:migrate` — aplica migrations (drizzle)
- `bun run be:generate` — gera migrações (drizzle)

## Estrutura

```
invite-saas/
  package.json          # workspaces e scripts orquestradores
  docs/                 # documentação compartilhada
  packages/
    be/                 # backend
    fe/                 # frontend (futuro)
```


INITIAL:

You are a **Staff Software Engineer specialized in scalable backend architecture, SaaS systems, and production-grade infrastructure**.

Your task is to **design and generate the initial backend setup of a professional SaaS backend**, prioritizing **clean architecture, modularity, maintainability, performance, and scalability**, while avoiding unnecessary complexity.

The goal is to create **a high-quality backend foundation** that supports rapid MVP development but remains robust enough for long-term scaling.

You must act as an **experienced backend architect**, making sound technical decisions and following industry best practices.

---

# Tech Stack (Mandatory)

The backend must use:

Runtime

* Bun

HTTP Framework

* ElysiaJS

Language

* TypeScript

Database

* PostgreSQL (SUPABASE)

ORM

* Drizzle ORM

Authentication

* Better Auth

API Style

* REST API

Validation

* Type-safe request validation (prefer lightweight solutions)
* ZOD validator (docs: https://zod.dev/)

Environment Variables

* dotenv

Linting / Formatting

* ESLint
* Prettier


---

# Project Goal

Create the **backend foundation for a SaaS that generates temporary event invitation pages**.

At this stage, **do NOT implement full product business logic**.

Only implement:

* project architecture
* HTTP server
* database connection
* authentication foundation
* modular domain structure
* development tooling
* code standards

The architecture must allow **rapid feature development later without structural refactoring**.


# Desired Project Structure

Create a **feature-driven modular structure**.

Modules must be **independent and cohesive**, representing a single domain responsibility.

# Initial Backend Setup

Implement the following core features:
 
 
1. Elysia (https://bun.com/docs) // (https://elysiajs.com/table-of-content.html)
3. Better Auth (https://better-auth.com/docs/introduction) // (https://better-auth.com/docs/authentication/google)
5. Supabase + Drizzle (https://elysiajs.com/blog/elysia-supabase)
6. Modular route registration
7. Feature-based modules
8. Environment configuration
9. Clean project bootstrap
10. Development scripts


# TypeScript Requirements

Use strict TypeScript configuration.

Requirements:

* strict mode enabled
* explicit typing
* no implicit any
* consistent imports
* strong typing across services and controllers


# Code Quality Tooling

Configure:

ESLint
Prettier

Code must follow consistent formatting rules.

---

# Error Handling

Implement **centralized error handling**.

Avoid try/catch duplication across controllers.

All errors must pass through a **global error middleware**.

---

# Code Standards

Follow these rules:

Use:

* async/await
* small focused functions
* stateless services
* thin controllers
* clear naming conventions

Avoid:

* business logic inside routes
* direct database queries inside controllers
* unnecessary abstractions
* large utility files

---

# Future Scalability

The architecture should allow:

* containerization with Docker
* migration to cloud infrastructure
* future message queues
* horizontal scaling
* microservice extraction if needed

---

# Final Objective

Generate a **clean, minimal, production-ready backend boilerplate**.

The generated code must be:

* clean
* minimal
* modular
* maintainable
* scalable
* easy to extend

At the end, provide a **brief explanation of each major component and architectural decision**.




NEXT STEPS:
TDD development.