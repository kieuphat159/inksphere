# InkSphere

**InkSphere** is a full-stack monorepo blog and social platform consisting of:

- `apps/frontend` — Next.js client application
- `apps/api` — NestJS + GraphQL + Prisma backend

The project supports authentication, post management, comments, likes, friend connections, real-time chat, and voice calling. The frontend and backend communicate via GraphQL, WebSocket, and a set of API routes dedicated to authentication.

## Project Overview

This repository is built as a personal content platform enriched with social interaction features:

- Browse the list of posts and view post detail pages.
- Sign in / sign up via email or Google OAuth.
- Create, update, and delete posts.
- Comment on and like posts.
- Send friend requests and manage friendships.
- Real-time chat, including direct messages and group conversations.
- Voice calling via application-level WebSocket signaling.

## Tech Stack

**Frontend**

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- Radix UI
- Socket.IO client
- Zod

**Backend**

- NestJS 11
- GraphQL (Apollo)
- Prisma
- PostgreSQL
- Passport, JWT, Google OAuth
- Socket.IO
- Argon2

**Development Infrastructure**

- Turborepo
- npm workspaces

## Repository Structure

```text
.
├── apps
│   ├── frontend   # Next.js app
│   └── api        # NestJS API
├── package.json   # root scripts
├── turbo.json
└── README.md
```

## Core Features

### Frontend

- Home page displaying posts with pagination.
- Post detail page with comments and likes.
- Sign-in, sign-up, and user profile pages.
- Create, update, and delete posts.
- Friends page for managing friendships.
- Chat area with sidebar, threads, and call panel.

### Backend

- GraphQL schema for users, posts, comments, tags, likes, and friendships.
- Auth module with JWT and Google OAuth.
- Prisma schema for PostgreSQL.
- Chat module over WebSocket.
- Call module for real-time signaling.
- Data seeding via Prisma seed scripts.

## System Requirements

- Node.js 20 or later
- npm 10 or later
- PostgreSQL
- A Google OAuth account, if Google sign-in is required
- Supabase, if using the current frontend upload flow

## Installation

From the repository root:

```bash
npm install
```

This installs dependencies for the entire monorepo and runs the backend's `postinstall` script to generate the Prisma client.

## Environment Variables

The project currently relies on the following environment variables.

### Backend (`apps/api`)

```bash
DATABASE_URL=
DIRECT_URL=
FRONTEND_URL=http://localhost:3000
PORT=8000
JWT_SECRET=
JWT_EXPIRES_IN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CHAT_QUEUE_CONCURRENCY=2
CHAT_QUEUE_MAX_PENDING=200
CHAT_SEND_RATE_LIMIT=8
CHAT_SEND_RATE_WINDOW_MS=5000
CHAT_USER_CACHE_TTL_MS=30000
CHAT_MEMBERSHIP_CACHE_TTL_MS=15000
AUTH_USER_CACHE_TTL_MS=30000
```

### Frontend (`apps/frontend`)

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
SESSION_SECRET_KEY=
SUPABASE_URL=
SUPABASE_API_KEY=
```

### Configuration Notes

- `DATABASE_URL` and `DIRECT_URL` must point to a PostgreSQL instance.
- `FRONTEND_URL` must match the frontend domain for CORS and OAuth callbacks to work correctly.
- `JWT_SECRET` and `SESSION_SECRET_KEY` should be strong, unique values — never use default secrets in production.
- `GOOGLE_CALLBACK_URL` must match the callback URL registered in Google Cloud Console.

## Database

The backend uses Prisma, with the schema located at `apps/api/prisma/schema.prisma`.

Common commands:

```bash
# Generate the Prisma client
npm run db:generate --workspace=api

# Seed the database
npm run db:seed --workspace=api
```

If working directly inside `apps/api`, you can instead run:

```bash
npm run db:generate
npm run db:seed
```

## Running in Development

Use two terminals, or run the root-level command:

```bash
npm run dev
```

By default:

- Frontend runs at `http://localhost:3000`
- Backend runs at `http://localhost:8000`

To run each app individually:

```bash
npm run dev --workspace=frontend
npm run dev --workspace=api
```

## Build and Production

### Running locally
```bash
npm run build
```

Then start each app by workspace as needed:

```bash
npm run start --workspace=frontend
npm run start --workspace=api
```

### Running with Docker Compose
The platform is fully containerized and configured for local deployment via Docker Compose.

1. Configure `.env` files for both applications:
   - `apps/api/.env` (Google Client IDs, database connection details, etc.)
   - `apps/frontend/.env` (Session secret key, etc.)
2. Launch the services:
   ```bash
   docker-compose up --build
   ```

*Notes:*
- The PostgreSQL database and Redis stack will start up automatically.
- Database migrations will deploy automatically at startup via NestJS `db:migrate` workspace tasks.
- Network routing is fully pre-configured; NestJS API and Next.js SSR communicate directly via the private Docker network bridge (`http://api:8000`), while browser-level client fetches resolve via `http://localhost:8000`.

## Quality Checks & Testing

```bash
# Run ESLint checks
npm run lint
```

The backend workspace (`api`) provides automated testing pipelines:

```bash
# Unit tests
npm run test --workspace=api

# End-to-end tests (runs with force-exit cleanup hooks)
npm run test:e2e --workspace=api

# Test coverage
npm run test:cov --workspace=api
```

## Security & Performance Optimizations

InkSphere implements production-grade optimizations and security configurations:

- **Strict XSS Sanitization:** Custom `XssSanitizationPipe` strips HTML/Script tags from user inputs on the API before database write. Only targets plain input objects to safeguard system elements.
- **Global Rate Limiting:** Powered by `@nestjs/throttler` to protect GraphQL and REST endpoints from brute force and denial of service.
- **Header Protection:** Helmet integration protects against sniffing, XSS, clickjacking, and MIME vulnerabilities.
- **Redis Connection Fallback:** WebSocket adapters dynamically connect to Redis and failover to internal in-memory fallback mappings in the event of an outage.
- **Google OAuth Code Exchange:** High-security code exchange flow resolves tokens backend-side, mapping short-lived tokens on Redis to shield credentials from URL leaks.
- **Image Optimization & Lazy Loading:** Utilizes `next/image` prioritizing hero images, and client-only wrapper components (`ChatDockWrapper.tsx`) to lazy-load chat modules, cutting JS bundle size by 100% for first-time visitors.

## Authentication Flow

Authentication is implemented across multiple layers:

- Email/password registration and login.
- JWT for backend sessions.
- Session cookie/JWT on the frontend to protect routes.
- Google OAuth via Passport.

Routes under `/user/*` on the frontend are protected by middleware; unauthenticated users are redirected to `/auth/signin`.

## Real-Time Communication

The repository has two main real-time flows:

- Chat via Socket.IO
- Call/signaling via a WebSocket gateway

The backend includes rate-limiting and queueing parameters to prevent message spam and reduce load under high concurrent connections.

## Local Setup Guide

If you're cloning this repository to run it from scratch, the recommended order is:

1. Create `.env` files for both backend and frontend.
2. Set up PostgreSQL and run the Prisma migrations.
3. Run `npm install` from the root.
4. Run `npm run db:generate` if the Prisma client needs to be regenerated.
5. Run `npm run dev`.

## Source Notes

- `apps/api/src/schema.gql` is the GraphQL schema generated using the code-first approach.
- `apps/frontend/lib/actions` contains server actions and data-fetching helpers.
- `apps/frontend/app/api/auth/*` contains internal routes for authentication.
- `apps/api/prisma/migrations` contains the database's migration history.