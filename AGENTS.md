# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Personal portfolio website for Twin Edo Nugraha. Next.js 16 frontend with an embedded Elysia.js API backend, Prisma ORM against PostgreSQL, deployed to Vercel. Includes a protected admin dashboard (CMS) for managing portfolio content.

## Commands

### Development
```bash
npm run dev          # Start Next.js dev server (Turbopack, default)
npm run dev:webpack  # Start Next.js dev server (Webpack)
```

### Build & Lint
```bash
npm run build        # Production build
npm run lint         # ESLint (flat config, eslint.config.mjs)
```

### Prisma / Database
```bash
npm run db:generate                            # Generate Prisma client (from src/backend)
cd src/backend && npx prisma migrate deploy    # Run migrations
cd src/backend && npx prisma studio            # Open Prisma Studio
```

The backend has its own `package.json` at `src/backend/`. When adding backend dependencies, install them there. Vercel's install command runs `npm install && cd src/backend && npm install && npx prisma generate`.

### No test suite
There is no test framework configured in this project.

## Architecture

### Monorepo-style layout (single repo, two package.json files)
- **Root** (`package.json`): Next.js app, React, Tailwind, frontend deps.
- **Backend** (`src/backend/package.json`): Elysia.js, Prisma, bcryptjs, Vercel Blob — backend-only deps.

### API: Elysia embedded in Next.js catch-all route
All API traffic is handled by a single Next.js catch-all route at `src/app/api/[[...slugs]]/route.ts`. This file re-exports Elysia's `handle` method from `src/backend/index.ts`. The Elysia app is mounted at `/api` prefix and registers service controllers via `.use()`.

### Backend service structure (MVC-ish)
Each domain lives in `src/backend/src/services/<domain>/`:
- `index.ts` — re-exports controller
- `controller.ts` — Elysia route definitions with request validation (`t.Object()`), calls model functions
- `model.ts` — Prisma queries, pure data access
- `types.ts` (optional) — domain-specific TypeScript types
- `utils.ts` (optional) — domain helpers

Domains: `auth`, `cv`, `experience`, `projects`, `projectImages`.

### Auth & admin middleware
JWT auth via `@elysiajs/jwt`. Protected endpoints use `beforeHandle: adminMiddleware()` which extracts the Bearer token, verifies JWT, and restricts access to a single superadmin email. Admin dashboard pages are under `src/app/admin/`.

### Frontend data fetching
- `src/services/<domain>/index.ts` — fetch wrappers + React Query hooks (e.g., `useGetProjects`, `useGetExperiences`). These call `/api/...` endpoints and return typed data.
- React Query provider wraps the app in `src/provider/useReactQuery.tsx`.
- All API responses follow `ApiSuccessResponse<T>` / `ApiErrorResponse` shapes defined in `src/shared/types/api.ts`.

### State management
Zustand stores in `src/stores/` with `persist` middleware using localStorage. Used for passing project detail data between pages and tracking selected tab state.

### Shared types
`src/shared/` contains types and helpers used by both frontend and backend:
- `types/` — `Project`, `ProjectImage`, `Experience`, `ProfileProps`, API response types
- `helper/` — `successResponse()`, `errorResponse()`, `formatError()`
- `features/experiences/` — Experience input/update types

The barrel export at `src/shared/index.ts` is used by both sides.

### Prisma schema
Located at `src/backend/prisma/schema.prisma`. PostgreSQL with models: `CV`, `Experience`, `Project`, `ProjectImage`, `User`. Uses Prisma Accelerate in production when `DATABASE_URL` starts with `prisma://`, otherwise direct connection. Singleton client in `src/backend/prisma/client/index.ts`.

### Tutorials
Static tutorial content lives in `src/app/tutorials/content/`. Each tutorial exports a `TutorialMeta` object and a React `Content` component. They're registered in the `tutorialModules` array in `content/index.ts` and rendered via the dynamic `[slug]` page.

### Path alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### UI
Tailwind CSS 3 with shadcn/ui (new-york style, components at `src/components/ui/`). `cn()` utility from `src/lib/utils.ts` for class merging. Framer Motion for animations. Geist font via `next/font`.

### File storage
Project images and CV files are stored in Vercel Blob in production. The backend falls back to local filesystem in development. Blob URLs are stored in the database alongside records.

## Environment Variables

Key variables (defined in `.env`, gitignored):
- `DATABASE_URL` — PostgreSQL connection (or Prisma Accelerate URL)
- `DIRECT_DATABASE_URL` — Direct DB connection for Vercel
- `JWT_SECRET` / `NEXT_PUBLIC_JWT_SECRET` — JWT signing secret
- `NEXT_PUBLIC_BASE_URL` — Public site URL
- `CV_UPLOAD_DIR` — Optional override for CV file storage path
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob access token

## Node Version

Node 20 (specified in `.nvmrc` as `20.11.0`).
