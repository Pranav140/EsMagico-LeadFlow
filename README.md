# LeadFlow CRM

A full-stack CRM application for tracking sales leads and managing customer discussions, built with React, Express, Prisma, and PostgreSQL.

---

## Overview

LeadFlow CRM lets sales teams manage their pipeline end-to-end. You can create leads, track their status through a customisable pipeline, log discussion notes, set follow-up reminders, and get a daily dashboard of what needs attention today.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS        |
| Backend    | Node.js, Express 4, TypeScript                  |
| ORM        | Prisma 5                                        |
| Database   | PostgreSQL 16                                   |
| HTTP Client| Axios                                           |
| Date Utils | date-fns                                        |
| Icons      | lucide-react                                    |
| Container  | Docker, Docker Compose                          |

---

## Prerequisites

- **Node.js** v20+
- **Docker** & **Docker Compose** (for the recommended setup)
- **Git**

---

## Quick Start — Docker (Recommended)

The easiest way to run the full stack with a single command:

```bash
git clone https://github.com/Pranav140/EsMagico-LeadFlow.git
cd EsMagico-LeadFlow

# Copy environment file
cp backend/.env.example backend/.env

# Build and start all services
docker compose up --build
```

The first run will:
1. Start PostgreSQL and wait for it to be healthy
2. Run database migrations automatically
3. Seed the database with 5 sample leads
4. Start the backend API with hot-reload
5. Start the Vite dev server

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:3001        |
| Postgres | localhost:5433 (host access) |

> **Note:** The Postgres container is mapped to host port `5433` to avoid conflicts with any existing local PostgreSQL installation.

---

## Manual Setup — Without Docker

### 1. Clone the repository

```bash
git clone https://github.com/Pranav140/EsMagico-LeadFlow.git
cd EsMagico-LeadFlow
```

### 2. Setup the database

Ensure you have PostgreSQL running locally, then create a database:

```sql
CREATE USER leadflow WITH PASSWORD 'leadflow_secret';
CREATE DATABASE leadflow_db OWNER leadflow;
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Run migrations & seed

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 6. Start the servers

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                              | Example                                                                 |
|----------------|------------------------------------------|-------------------------------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string             | `postgresql://leadflow:leadflow_secret@localhost:5433/leadflow_db`      |
| `PORT`         | Express server port                      | `3001`                                                                  |
| `FRONTEND_URL` | Allowed CORS origin                      | `http://localhost:5173`                                                 |
| `NODE_ENV`     | Runtime environment                      | `development`                                                           |

### Frontend (`frontend/.env`)

| Variable       | Description                              | Example                          |
|----------------|------------------------------------------|----------------------------------|
| `VITE_API_URL` | Base URL for all API requests            | `http://localhost:3001/api`      |

---

## API Endpoints

Base URL: `http://localhost:3001/api`

| Method   | Endpoint                       | Description                                              | Body / Params                                           |
|----------|--------------------------------|----------------------------------------------------------|---------------------------------------------------------|
| `GET`    | `/leads`                       | Get all leads (with last discussion + next follow-up)    | `?status=NEW` `?search=string`                         |
| `GET`    | `/leads/follow-ups/today`      | Get today's and overdue follow-ups                       | —                                                       |
| `GET`    | `/leads/:id`                   | Get a single lead with full discussion history           | `:id` — lead CUID                                       |
| `POST`   | `/leads`                       | Create a new lead (auto-creates first discussion)        | `{ name*, company?, phone? }`                          |
| `PATCH`  | `/leads/:id/status`            | Update lead status                                       | `{ status: LeadStatus }`                               |
| `POST`   | `/leads/:id/discussions`       | Add a discussion note to a lead                          | `{ note*, followUpAt?: ISO8601 }`                      |

**LeadStatus values:** `NEW` · `CONTACTED` · `QUALIFIED` · `PROPOSAL_SENT` · `WON` · `LOST`

---

## Features

### Lead Management
- ✅ Create leads with name, company, and phone number
- ✅ View all leads in a responsive card grid
- ✅ Filter leads by status (New, Contacted, Qualified, Proposal Sent, Won, Lost)
- ✅ Debounced search by name or company (300ms)
- ✅ Update lead status via a custom inline dropdown
- ✅ Optimistic status updates — UI updates instantly, reverts on error

### Discussion Timeline
- ✅ Log discussion notes against any lead
- ✅ Set optional follow-up date and time per note
- ✅ View full discussion history sorted newest-first with a visual timeline
- ✅ Formatted timestamps: "May 4, 10:30 AM (2 days ago)"

### Follow-up Dashboard
- ✅ Dedicated "Today's Follow-Ups" section on the landing page
- ✅ Overdue follow-ups highlighted with red left border and "⚠️ OVERDUE" label
- ✅ Today's follow-ups highlighted in blue with scheduled time

### UX & Polish
- ✅ Skeleton loaders (animate-pulse) during initial data fetch
- ✅ Error banner with retry button on load failure
- ✅ Empty state UI for no leads / no follow-ups
- ✅ WON leads rendered with muted styling; LOST leads with strikethrough
- ✅ Color-coded status badges per pipeline stage
- ✅ ESC key closes any open modal
- ✅ Click outside backdrop closes modal
- ✅ Body scroll lock while modal is open
- ✅ Focus trap — Tab cycles within modal (accessibility)
- ✅ `aria-label` on all interactive elements
- ✅ `role="button"` + `onKeyDown` on lead cards (keyboard accessible)

### Infrastructure
- ✅ Fully Dockerised — single `docker compose up --build` starts everything
- ✅ Auto-runs migrations and seed on backend container start
- ✅ Hot-reload in both frontend (Vite HMR) and backend (`tsx watch`)
- ✅ Healthcheck-based service dependency chain (backend waits for Postgres)

---

## Project Structure

```
leadflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Lead + Discussion models
│   │   ├── seed.ts              # 5 sample leads with discussions
│   │   └── migrations/          # Auto-generated SQL migrations
│   ├── src/
│   │   ├── app.ts               # Express app setup (middleware, routes)
│   │   ├── index.ts             # Server entry point
│   │   ├── controllers/
│   │   │   └── leadsController.ts
│   │   ├── routes/
│   │   │   └── leads.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   └── prisma/
│   │       └── client.ts        # Singleton Prisma client
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── leads.ts         # Axios API client
│   │   ├── components/
│   │   │   ├── AddLeadModal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   └── LeadDetailModal.tsx
│   │   ├── hooks/
│   │   │   ├── useFocusTrap.ts
│   │   │   └── useLeads.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

---

## Assumptions & Trade-offs

| Decision | Rationale |
|----------|-----------|
| **Postgres on port 5433** | Port 5432 was occupied by an existing local PostgreSQL instance. Port 5433 avoids conflicts without requiring the user to stop other services. |
| **No authentication** | Out of scope for this project. A production version would add JWT-based auth and per-user lead ownership. |
| **`useState` + `useEffect` for state** | Keeps the frontend dependency tree minimal. Zustand or React Query would be the natural next step for caching and background refresh. |
| **Optimistic status updates** | Provides snappier UX. The UI reverts silently on error, which is acceptable for a status change — the user can simply try again. |
| **Discussion sort order** | Discussions are sorted `createdAt DESC` at the database level, so the newest note always appears at the top of the timeline without client-side sorting. |
| **Seed data preserved in migrations** | The seed script is idempotent in spirit (fresh database only) rather than using `upsert`, keeping it simple and readable. |
| **No build step for production** | The Dockerfiles use the Vite dev server and `tsx watch` — suitable for a development/demo environment. A production setup would add a multi-stage build (`npm run build` + `nginx`). |

---

## License

MIT
