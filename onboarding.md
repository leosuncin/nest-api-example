# Onboarding: nest-api-example

A blog REST API (users, articles, comments) used as an onboarding project. This file explains how to run it locally and how the code is organized.

## Stack

- **NestJS 10** (Express) with **TypeScript 5.9** and **Node 20+**
- **TypeORM + PostgreSQL** (`pg`), with migrations. `typeorm-extension` is used for seeds and factories
- **Auth:** Passport + JWT (`@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`), passwords hashed with `bcryptjs`. `hibp` checks whether a password has appeared in a data breach
- **Validation:** `class-validator` + `class-transformer`
- **Pagination:** `nestjs-typeorm-paginate`
- **Cache:** `@epic-web/cachified` + `lru-cache` (in memory)
- **Health check:** `@nestjs/terminus`
- **Config:** `@nestjs/config` with `expandVariables`, which lets the app resolve `${...}` placeholders in `.env`
- **Tests:** Jest, `supertest`, `pactum` (e2e)

## Run it locally

### 1. Prerequisites

Check that everything is installed:

```bash
node -v      # >= 20
pnpm -v
docker -v
git --version
```

Docker Desktop must be running. Ports **3000** (app), **5433** (Postgres) and **8081** (pgweb) must be free.

### 2. Install

If you don't have pnpm, install it with:

```bash
npm install -g pnpm
```

Then install the dependencies and create your local env file:

```bash
pnpm install
cp .env.example .env
```

`.env.example` is a template kept in Git. `.env` is your own local copy (it is ignored by Git) and is the file the app actually reads.

### 3. Edit `.env`

Set `DATABASE_URL` with literal values (no `${...}`) and port **5433**:

```
DATABASE_URL=postgres://postgres:password@localhost:5433/postgres
```

Why literal values: the migration command loads `.env` with plain `dotenv`, which does not resolve `${POSTGRES_USER}`. See "Problems I hit" below.

### 4. Database (Docker)

In `docker-compose.yml`, the Postgres port mapping must be:

```yaml
ports:
  - '5433:5432'
```

(`host:container`. Only the host side changes, the container still listens on 5432.) Then start it:

```bash
docker compose up -d
docker compose ps
```

Both `postgres` and `pgweb` should be `Up`, and `postgres` should be `healthy`. pgweb (a web UI for the database) is at http://localhost:8081.

### 5. Migrations

```bash
pnpm typeorm migration:run
```

This creates the tables `user`, `article`, `comment` and `migrations`. You can check them in pgweb.

### 6. Start the app

```bash
pnpm start:dev
```

Wait for `Nest application successfully started`. The app listens on http://localhost:3000.

### 7. Run the tests

```bash
pnpm test        # unit tests
pnpm test:e2e    # e2e tests (the app must be running)
```

## Project structure (`src/`)

Top level:

- `main.ts`: entry point. Creates the Nest app, sets the global `ValidationPipe`, cookie parser, and starts listening
- `app.module.ts`: root module, it brings together the `auth` and `blog` modules
- `auth/`: registration, login, JWT authentication, the `User` entity
- `blog/`: articles and comments, with their entities, controllers and services
- `common/`: shared code used by several modules (decorators, DTOs, test helpers)
- `config/`: app configuration (`configuration.ts`) and the TypeORM data source files used by the app and the CLI (`data-source.ts`, `data-source.cli.ts`)
- `migrations/`: database migrations (creates `user`, then `article` and `comment`)
- `bin/`: `health-checker.ts`, a small script that calls `/health` and exits with 0 or 1 (useful for Docker health checks)
- `health.controller.ts`: the `/health` endpoint
- `repl.ts`: interactive console for the app (`pnpm start:repl`)

Inside `auth/` and `blog/` the same folders repeat:

- `controllers/`: HTTP routes
- `services/`: business logic
- `entities/`: TypeORM entities (the tables)
- `dto/`: shape and validation of incoming data
- `guards/`, `interceptors/`, `pipes/`: code that runs around the controllers (auth checks, request/response changes, input transformation)
- `validators/`: custom `class-validator` rules
- `factories/`, `seeders/`, `fixtures/`: fake data for tests and for seeding the database

Only `auth/` also has `strategies/` (the JWT strategy for Passport) and `providers/` (for example the password-breach check).

## Problems I hit and how I fixed them

**1. Port 5432 already in use.**
`docker compose up -d` failed with `address already in use`, because a local PostgreSQL was already running on 5432 (found with `lsof -i :5432`). Fix: map the container to a different host port in `docker-compose.yml`, `5433:5432` (it was `5432:5432`), and use `localhost:5433` in `DATABASE_URL`. pgweb keeps using `postgres:5432` because it talks to the database inside the Docker network.

**2. `password authentication failed for user "${POSTGRES_USER}"`.**
`pnpm typeorm migration:run` sent the literal text `${POSTGRES_USER}` as the user name. The app expands these variables (`expandVariables`), but the TypeORM CLI loads `.env` with plain `dotenv`, which does not. Fix: write the real values directly in `DATABASE_URL`.

## Test results

- Unit tests: **30 test suites, 179 tests, 2 snapshots, all passed**
- e2e tests: _(to fill in)_
