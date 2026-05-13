# Bug Tracking System — Kafka Edition

A microservices bug tracking system. Customers report bugs, admins assign them to staff, and all parties receive real-time notifications powered by Apache Kafka.

---

## Architecture

```
React :3000
    │
    ▼
API Gateway :9080
    │
    ├──► User-Auth-Service :9081  →  user_db
    ├──► Bug-Service :9082        →  bug_db
    │       ├─ OpenFeign ──────►  Project-Service :9083
    │       └─ Kafka publish ──►  Notification-Service :9084
    ├──► Project-Service :9083   →  project_db
    └──► Notification-Service :9084 → notification_db

All services register via:
  Discovery-Service (Eureka) :9761

Message broker:
  Kafka :9092  (managed by Zookeeper :2181)
  Kafka UI :9085
```

### Kafka Event Topics

| Topic | Published by | Consumed by | Notifies |
|---|---|---|---|
| `bug-created-topic` | Bug-Service | Notification-Service | Admin |
| `bug-assigned-topic` | Bug-Service | Notification-Service | Staff |
| `bug-solved-topic` | Bug-Service | Notification-Service | Customer |
| `bug-comment-topic` | Bug-Service | Notification-Service | Admin |
| `admin-message-topic` | Bug-Service | Notification-Service | Customer |
| `User-registered-event` | User-Auth-Service | Notification-Service | Admin |

---

## Prerequisites

| Tool | macOS | Windows |
|---|---|---|
| **Docker Desktop** | [download](https://www.docker.com/products/docker-desktop/) | [download](https://www.docker.com/products/docker-desktop/) |
| **Node.js 18+** | `brew install node` | [download](https://nodejs.org/) |
| Git | pre-installed | [download](https://git-scm.com/) |

No Java, Maven, or Kafka installation needed — everything runs inside Docker.

> **Windows users:** Use **PowerShell** or **Git Bash** for all commands below. Do not use CMD — it does not support the multi-line `curl` syntax used here.

---

## Running the Project

### Step 1 — Start the backend

**macOS / Linux:**
```bash
cd backend
docker-compose up --build
```

**Windows (PowerShell):**
```powershell
cd backend
docker-compose up --build
```

First build downloads all Maven dependencies and Docker images — allow **8–10 minutes**. Every subsequent start takes about **1 minute** (images are cached).

> Do not close the terminal. Keep it running to see live logs from all services.

### Step 2 — Verify the backend is ready

Open **http://localhost:9761** in your browser — this is the Eureka dashboard.

Wait until all 5 of these names appear in the "Instances currently registered" section:

```
API-GATEWAY
USER-SERVICE
BUG-SERVICE
PROJECT-SERVICE
NOTIFICATION-SERVICE
```

This takes about 60–90 seconds after the containers start. Do not proceed to Step 3 until all 5 are registered.

### Step 3 — Start the frontend

Open a **second terminal** window:

**macOS / Linux:**
```bash
cd frontend
npm install
npm run dev
```

**Windows (PowerShell):**
```powershell
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Stopping the Project

```bash
# Stop everything, keep the database data
docker-compose down

# Stop everything AND wipe all data (clean slate)
docker-compose down -v
```

---

## Rebuilding a Single Service

After changing backend code, rebuild only the affected service instead of everything:

```bash
docker-compose up --build bug-service
```

Replace `bug-service` with any of: `user-auth-service`, `project-service`, `notification-service`, `api-gateway`, `discovery-service`.

---

## Verifying the Full Flow (curl)

These commands confirm the entire system works end-to-end including Kafka notifications.

> **Windows users:** The multi-line `\` syntax works in PowerShell. In Git Bash, use the same commands as macOS.

### 1. Register users

```bash
# Admin
curl -s -X POST http://localhost:9080/users/accounts/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Ahmed Admin\",\"phoneNumber\":\"01012345678\",\"age\":30,\"email\":\"admin@test.com\",\"password\":\"admin1234\",\"role\":\"ADMIN\"}"

# Staff
curl -s -X POST http://localhost:9080/users/accounts/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Sara Staff\",\"phoneNumber\":\"01098765432\",\"age\":26,\"email\":\"staff@test.com\",\"password\":\"staff1234\",\"role\":\"STAFF\",\"job\":\"BACKEND\"}"

# Customer
curl -s -X POST http://localhost:9080/users/accounts/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Omar Customer\",\"phoneNumber\":\"01011112233\",\"age\":24,\"email\":\"customer@test.com\",\"password\":\"customer1234\",\"role\":\"CUSTOMER\"}"
```

Save the `id` from each response — you will need them as `ADMIN_ID`, `STAFF_ID`, `CUSTOMER_ID` in the steps below.

### 2. Login

```bash
curl -s -X POST http://localhost:9080/users/accounts/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin1234\"}"
```

### 3. Create a project (Admin)

```bash
curl -s -X POST http://localhost:9080/projects/insert \
  -H "Content-Type: application/json" \
  -H "role: ADMIN" \
  -d "{\"projectName\":\"My Project\",\"description\":\"A test project\",\"adminId\":ADMIN_ID}"
```

### 4. Report a bug (Customer)

```bash
curl -s -X POST http://localhost:9080/bugs/insert \
  -H "Content-Type: application/json" \
  -H "userId: CUSTOMER_ID" \
  -d "{\"title\":\"Login page crashes\",\"description\":\"500 error on submit\",\"priority\":\"HIGH\",\"projectName\":\"My Project\"}"
```

→ Kafka fires `bug-created-topic` → Admin receives an UNREAD notification.

### 5. Check admin notifications

```bash
curl -s http://localhost:9080/notifications/my-notifications -H "userId: ADMIN_ID"
```

### 6. Assign bug to staff (Admin)

```bash
curl -s -X PUT http://localhost:9080/bugs/assign \
  -H "Content-Type: application/json" \
  -H "userId: ADMIN_ID" \
  -d "{\"bugId\":1,\"staffId\":STAFF_ID}"
```

→ Kafka fires `bug-assigned-topic` → Staff receives an UNREAD notification.

### 7. Solve bug (Staff)

```bash
curl -s -X PUT http://localhost:9080/bugs/solve \
  -H "Content-Type: application/json" \
  -H "userId: STAFF_ID" \
  -d "{\"bugId\":1,\"customerId\":CUSTOMER_ID}"
```

→ Kafka fires `bug-solved-topic` → Customer receives an UNREAD notification.

### 8. Check customer notifications

```bash
curl -s http://localhost:9080/notifications/my-notifications -H "userId: CUSTOMER_ID"
```

---

## Monitoring Tools

| Tool | URL | Purpose |
|---|---|---|
| Frontend | http://localhost:3000 | Main UI |
| Eureka Dashboard | http://localhost:9761 | Check all services are registered |
| Kafka UI | http://localhost:9085 | Inspect Kafka topics and messages |

---

## Auth Model

There is no JWT. After login, the frontend stores `data.id` and `data.role` and sends them as plain headers on every request:

```
userId: 1
role: ADMIN
```

Roles: `ADMIN` `STAFF` `CUSTOMER`

---

## Bug Lifecycle

```
OPEN → ASSIGNED → IN_PROGRESS → FIXED → CLOSED
                             ↘ SOLVED
```

---

## Troubleshooting

### Services show as "Exited" immediately after starting

MySQL databases were not created. Run:

```bash
docker exec bugtrackerKafka-mysql mysql -uroot -p1234 -e "
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS bug_db;
CREATE DATABASE IF NOT EXISTS project_db;
CREATE DATABASE IF NOT EXISTS notification_db;
"
```

Then restart the failed services:

```bash
docker-compose start user-auth-service bug-service project-service notification-service
```

This only happens if the MySQL volume existed from a previous run before `init-db.sql` was added. A fresh `docker-compose down -v && docker-compose up --build` avoids it entirely.

---

### Kafka crashes with `KeeperErrorCode = NodeExists`

Stale Zookeeper data from a previous run. Do a full clean restart:

```bash
docker-compose down -v
docker-compose up --build
```

---

### Frontend shows "Provisional headers are shown" / no response

The API Gateway is not reachable. Check:

1. Is the gateway container running? `docker ps | grep api-gateway`
2. Is Eureka healthy? Open http://localhost:9761
3. Did the gateway start on the correct port? Check logs: `docker logs api-gateway-kafka`

---

### `503 Service Unavailable` for a few seconds after startup

Normal. The Eureka registry takes 30–60 seconds to propagate to the Gateway's load balancer cache after a service registers. Wait and retry.

---

### Windows-specific: `docker-compose` not found

On newer Docker Desktop for Windows, the command is `docker compose` (no hyphen):

```powershell
docker compose up --build
```

---

## Tech Stack

**Backend:** Java 21, Spring Boot 3.x, Spring Cloud Gateway, Netflix Eureka, OpenFeign, Spring Data JPA, Hibernate, Spring Kafka, MySQL 8, BCrypt, Docker, Maven

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand v5, Framer Motion, shadcn/ui, React Hook Form + Zod, Sonner
