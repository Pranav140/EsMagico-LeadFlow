# LeadFlow CRM

A modern, full-stack CRM application for managing your sales pipeline — built with React, Node.js, Prisma, PostgreSQL, and Docker.

---

## ✨ Features

- **Lead Management** — Create, read, update, and delete leads with full details
- **Status Tracking** — Pipeline stages: New → Contacted → Qualified → Proposal → Negotiation → Won/Lost
- **Priority Levels** — Low, Medium, High, Urgent with color-coded badges
- **Activity Timeline** — Log calls, emails, meetings, notes, and tasks per lead
- **Search & Filter** — Full-text search + filter by status, priority
- **Pagination** — Efficient server-side pagination
- **Dashboard Stats** — Total leads, deals won, revenue, and weekly new leads
- **Hot Reload** — Both frontend (Vite HMR) and backend (nodemon) hot reload in Docker

---

## 🏗️ Tech Stack

| Layer         | Technology                         |
|--------------|-------------------------------------|
| Frontend      | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend       | Node.js + Express + TypeScript      |
| ORM           | Prisma                              |
| Database      | PostgreSQL 16                       |
| Container     | Docker + Docker Compose             |

---

## 📁 Project Structure

```
leadflow/
  backend/
    src/
      routes/          # Express route definitions
      controllers/     # Request handlers
      middleware/      # Error handler, request logger
      prisma/          # Prisma client singleton
    prisma/
      schema.prisma    # Database schema
      seed.ts          # Sample data seeder
    .env.example
    package.json
    tsconfig.json
    Dockerfile
  frontend/
    src/
      components/      # React UI components
      hooks/           # Custom React hooks
      types/           # TypeScript type definitions
      api/             # Axios API service layer
    package.json
    tsconfig.json
    vite.config.ts
    tailwind.config.ts
    Dockerfile
  docker-compose.yml
  README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd leadflow

# Set up backend environment
cp backend/.env.example backend/.env

# Set up frontend environment
cp frontend/.env.example frontend/.env
```

### 2. Launch with Docker Compose

```bash
docker compose up --build
```

This will start:
- **PostgreSQL** on port `5432`
- **Backend API** on port `3001` (with hot reload)
- **Frontend** on port `5173` (with Vite HMR)

### 3. Run Database Migrations & Seed

In a separate terminal:

```bash
# Run migrations
docker compose exec backend npx prisma migrate dev --name init

# Seed sample data
docker compose exec backend npm run db:seed
```

### 4. Open the App

Visit [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Development (without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit DATABASE_URL to point to your local Postgres
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # Edit VITE_API_URL if needed
npm run dev
```

---

## 🌐 API Reference

### Leads

| Method | Endpoint           | Description                         |
|--------|--------------------|-------------------------------------|
| GET    | `/api/leads`       | List leads (paginated, filterable)  |
| GET    | `/api/leads/stats` | Dashboard statistics                |
| GET    | `/api/leads/:id`   | Get a single lead with activities   |
| POST   | `/api/leads`       | Create a new lead                   |
| PATCH  | `/api/leads/:id`   | Update a lead                       |
| DELETE | `/api/leads/:id`   | Delete a lead (cascades activities) |

#### Query Parameters for `GET /api/leads`

| Param       | Type   | Description                        |
|------------|--------|------------------------------------|
| `page`      | number | Page number (default: 1)           |
| `limit`     | number | Items per page (default: 10)       |
| `status`    | string | Filter by status enum              |
| `priority`  | string | Filter by priority enum            |
| `search`    | string | Search name, email, or company     |
| `sortBy`    | string | Field to sort by (default: createdAt) |
| `sortOrder` | string | `asc` or `desc` (default: desc)    |

### Activities

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/activities`     | List activities      |
| POST   | `/api/activities`     | Create an activity   |
| PATCH  | `/api/activities/:id` | Update an activity   |
| DELETE | `/api/activities/:id` | Delete an activity   |

---

## 🗄️ Database Schema

```prisma
model Lead {
  id         String       @id @default(cuid())
  firstName  String
  lastName   String
  email      String       @unique
  status     LeadStatus   @default(NEW)
  priority   LeadPriority @default(MEDIUM)
  value      Float?
  activities Activity[]
  ...
}

model Activity {
  id     String       @id @default(cuid())
  leadId String
  type   ActivityType
  title  String
  lead   Lead         @relation(...)
}
```

---

## 🐳 Docker Services

| Service    | Image            | Port  | Description           |
|-----------|------------------|-------|-----------------------|
| `postgres` | postgres:16-alpine | 5432 | PostgreSQL database  |
| `backend`  | Custom (node:20) | 3001  | Express API server    |
| `frontend` | Custom (node:20) | 5173  | Vite dev server       |

Hot reload is enabled via volume mounts:
- `./backend/src` → `/app/src`
- `./frontend/src` → `/app/src`

---

## 📜 Available Scripts

### Backend

```bash
npm run dev         # Start with hot reload
npm run build       # Compile TypeScript
npm run db:generate # Regenerate Prisma client
npm run db:migrate  # Run migrations
npm run db:seed     # Seed sample data
npm run db:studio   # Open Prisma Studio
```

### Frontend

```bash
npm run dev         # Start Vite dev server
npm run build       # Production build
npm run type-check  # TypeScript type checking
```

---

## 📄 License

MIT
