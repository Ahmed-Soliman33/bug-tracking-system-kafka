# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A microservices bug tracking system. Customers report bugs against projects, admins assign them to staff, and all parties receive automatic notifications. The repo has two independent sub-projects: a Spring Boot backend (`backend/`) and a React frontend (`frontend/`).

---

## Backend

### Running

All services run via Docker Compose — no local JDK or Maven required.

```bash
cd backend
docker-compose up --build          # first build ~8 min; subsequent ~1 min
docker-compose down                # stop (keeps DB)
docker-compose down -v             # stop + wipe DB
docker-compose up --build <name>   # rebuild a single service, e.g. bug-service
```

Verify: open http://localhost:9761 (Eureka) — all service names must appear before the system is ready.

Kafka UI is at http://localhost:9085 — inspect topics and messages.

### Running tests

```bash
cd backend/<Service-Name>
./mvnw test
./mvnw test -Dtest=ClassName        # single test class
```

### Service map

| Service | Host Port | Internal Port | DB |
|---|---|---|---|
| API Gateway | 9080 | 9080 | — |
| User-Auth-Service | 9081 | 9081 | `user_db` |
| Bug-Service | 9082 | 9082 | `bug_db` |
| Project-Service | 9083 | 9083 | `project_db` |
| Notification-Service | 9084 | 9084 | `notification_db` |
| Discovery-Service (Eureka) | 9761 | 9761 | — |
| Kafka | 9092 | 9092 | — |
| Kafka UI | 9085 | 9080 | — |
| MySQL | 3306 | 3306 | — |

All client traffic enters through the gateway at `:9080`. Never call inner service ports directly in application code.

The frontend API base URL is `http://localhost:8080` — note this is a leftover mismatch; the actual gateway runs on `:9080`. If you see connection errors, check `frontend/src/lib/api.js`.

### Architecture

```
React :3000 → API Gateway :9080 → User-Auth-Service :9081
                                 → Bug-Service :9082
                                     ├─ OpenFeign → Project-Service :9083 (verify project exists)
                                     └─ Kafka → Notification-Service :9084
                                 → Project-Service :9083
                                 → Notification-Service :9084
All services register via Netflix Eureka → Discovery-Service :9761
All services share MySQL 8 :3306 (4 separate databases)
Kafka + Zookeeper handle async notification events
```

Each service follows the same layered structure:
- `Controller` — REST endpoints, header-based auth checks
- `Service` / `ServiceImpl` — business logic
- `Repository` — Spring Data JPA
- `Entity` — JPA entities
- `DTO` — request/response shapes + Kafka event DTOs
- `Exception` — `GlobalExceptionHandler` + custom exceptions
- `Client` — OpenFeign clients for inter-service calls (Bug-Service only, for Project-Service lookups)
- `Config` — Kafka producer/consumer config

### Kafka event flow

Bug-Service publishes events; Notification-Service consumes them via `NotificationConsumer` (`@KafkaListener`). All events use `groupId = "notification-group"`.

| Topic | Producer | Consumer method |
|---|---|---|
| `bug-created-topic` | Bug-Service | `handleBugCreated` → notifies admin |
| `bug-assigned-topic` | Bug-Service | `handleBugAssigned` → notifies staff |
| `bug-solved-topic` | Bug-Service | `handleBugSolved` → notifies customer |
| `bug-comment-topic` | Bug-Service | `handleCommentEvent` → notifies admin |
| `admin-message-topic` | Bug-Service | `handleAdminMessage` → notifies customer |
| `User-registered-event` | User-Auth-Service | `handleUserRegistered` → notifies admin |

Event DTOs live in both `Bug-Service/DTO/` and are mirrored in `Notification-Service/DTO/`. The Notification-Service imports the Bug-Service DTO package directly.

### Auth model

No JWT. After login, the frontend stores `id` and `role` from the response and sends them as plain headers on every request:

```
userId: 4
role: ADMIN
```

Roles: `ADMIN`, `STAFF`, `CUSTOMER`

### User entity

`User` uses JPA single-table inheritance (`@Inheritance(strategy = SINGLE_TABLE)`) with subclasses `Admin`, `Staff`, `Customer`. `Staff` has an additional `job` field (`JobType` enum: `FRONTEND`, `BACKEND`, `FULLSTACK`, `QA`, `DEVOPS`, `MOBILE`). User-Auth-Service also has AOP aspects for logging and performance monitoring (`aspect/` package).

### Bug lifecycle

```
OPEN → ASSIGNED → IN_PROGRESS → FIXED → CLOSED
                             ↘ SOLVED
```

### Automatic notifications

| Trigger | Notifies |
|---|---|
| Bug created | project admin |
| Bug assigned | assigned staff |
| Bug solved | customer |
| Staff comment | admin |
| Admin message | customer |
| User registered | admin |

---

## Frontend

### Running

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm run preview
```

### Tech stack

React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand v5, Framer Motion, shadcn/ui (Radix primitives), React Hook Form + Zod, Sonner toasts.

Path alias: `@/` maps to `src/`.

### Architecture

**Auth** — `useAuthStore` (Zustand + cookie persistence via `js-cookie`). Stores `{ id, role, fullName, email }`. `ProtectedRoute` gates routes by role.

**API layer** — `src/lib/api.js` exports `get/post/put/del`. It reads `userId` and `role` from the auth store and automatically injects them as headers on every request. Base URL: `http://localhost:8080` (check this against the actual gateway port if services are unreachable).

**Routing** — role-based nested layouts in `App.jsx`:
- `/admin/*` → `AdminLayout` (ADMIN only)
- `/staff/*` → `StaffLayout` (STAFF only)
- `/customer/*` → `CustomerLayout` (CUSTOMER only)
- `/login`, `/register` — public

**Pages per role**

| Admin | Staff | Customer | Shared |
|---|---|---|---|
| AdminDashboard | StaffDashboard | CustomerDashboard | BugDetailPage |
| ProjectsListPage | MyAssignedBugsPage | MyBugsPage | NotificationsPage |
| CreateProjectPage | | CreateBugPage | |
| AllBugsPage | | | |
| UsersListPage | | | |

**Shared UI** — `src/components/ui/` contains shadcn/ui primitives. `src/lib/bugUtils.jsx` has shared helpers for badge colors and status/priority labels. `src/components/ErrorBoundary.jsx` wraps the app.

**Data fetching** — TanStack Query for all server state; optimistic updates used for mutation-heavy flows. Skeleton loaders in `src/components/ui/skeleton.jsx` and `stat-card-skeleton.jsx`.
