# SQL Tutor 2.0

Production monorepo for the SQL Tutor learning platform. **Core features work without AI.**

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 14, TypeScript, Tailwind, Monaco Editor |
| API | NestJS, Prisma, SQLite (dev) / PostgreSQL (prod) |
| SQL runtime | sql.js (browser) |
| Validation | `@sql-tutor/validation` (AST + result layers) |
| Shared | `@sql-tutor/shared` (challenges, types, dataset) |

## Quick start

```bash
# Install all workspaces
npm install

# Build shared packages
npm run build -w @sql-tutor/shared
npm run build -w @sql-tutor/validation

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Run API + Web (two terminals, or one command)
npm run dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000/v1/health

## Project structure

```
apps/
  web/          Next.js frontend (all pages)
  api/          NestJS backend
packages/
  shared/       Types, challenge seeds, dataset
  validation/   Multi-layer validation engine
legacy/         Original v1 Vite prototype (optional)
```

## Implemented phases

| Phase | Status |
|-------|--------|
| 1 Foundation | ✅ Monorepo, API, challenge player, sql.js |
| 2 Accounts | ✅ JWT auth, progress sync, guest challenges |
| 3 Monaco | ✅ Editor, workspace, query history |
| 4 Validation | ✅ AST + result + structural validation |
| 5 AI (optional) | ✅ Provider abstraction, BYOK, disabled by default |
| 6 Gamification | ✅ XP, levels, streaks, achievements, leaderboard |
| 7 Certificates | ✅ Exams API, verification URLs |
| 8 Enterprise | 🔶 Team models in DB, admin analytics stub |

## Environment

Copy `.env.example` to `.env` and `apps/api/.env`. Set `AI_ENABLED=true` only when you want platform AI.

## Legacy v1

The original Vite prototype remains in the repo root (`src/`, `index.html`). Use `npm run legacy:dev` if configured, or run the 2.0 app above.

## Docs

- [status.md](./status.md) — v1 audit
- [making it real webapp.md](./making%20it%20real%20webapp.md) — v2 specification
