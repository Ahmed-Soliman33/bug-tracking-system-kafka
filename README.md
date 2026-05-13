# Bug Tracker — Backend

A microservices-based bug tracking system built with Java 21 and Spring Boot. Customers report bugs, admins manage and assign them to staff, and everyone gets notified along the way.

---

## Architecture

```
Client (React :3000)
        │
        ▼
  API Gateway :8080
        │
  ┌─────┼──────────────────┐
  ▼     ▼                  ▼
User  Bug-Service    Project-Service
Auth  :8082          :8083
:8081    │
         ├──► Project-Service (verify project exists)
         └──► Notification-Service :8084

All services register with:
  Discovery-Service (Eureka) :8761
All services share:
  MySQL 8 :3306  (4 separate databases)
```

| Service | Port | Database |
|---|---|---|
| API Gateway | 8080 | — |
| User-Auth-Service | 8081 | `user_service` |
| Bug-Service | 8082 | `bug_service` |
| Project-Service | 8083 | `project_service` |
| Notification-Service | 8084 | `notification_service` |
| Discovery-Service (Eureka) | 8761 | — |

---

## Tech Stack

- **Java 21** + **Spring Boot 3.x**
- **Spring Cloud Gateway** — API gateway & routing
- **Netflix Eureka** — service discovery
- **OpenFeign** — inter-service REST calls
- **Spring Data JPA / Hibernate** — ORM
- **MySQL 8** — persistence
- **Spring Security + BCrypt** — password hashing
- **Docker & Docker Compose** — containerization
- **Maven** — build tool (runs inside Docker — no local Maven needed)

---

## Running the Project

### Prerequisites

**Docker Desktop** — nothing else required.

### Start

```bash
cd " backend"
docker-compose up --build
```

First build takes ~8 minutes (downloads Maven dependencies inside Docker). Every subsequent start takes ~1 minute.

### Verify everything is up

1. Open **http://localhost:8761** — Eureka dashboard
2. Wait until all 5 services appear: `USER-SERVICE`, `BUG-SERVICE`, `PROJECT-SERVICE`, `NOTIFICATION-SERVICE`, `API-GATEWAY`
3. Smoke test:
```bash
curl http://localhost:8080/projects
```

### Stop

```bash
docker-compose down        # keeps the database
docker-compose down -v     # wipes the database too
```

### Rebuild a single service after code changes

```bash
docker-compose up --build user-auth-service
```

---

## Authentication Model

There is **no JWT**. After login, store `data.id` and `data.role` from the response and send them as plain HTTP headers on every subsequent request:

```
userId: 4
role: ADMIN
```

Roles: `ADMIN` `STAFF` `CUSTOMER`

---

## Full Flow — curl One-Liners

All commands are single lines, safe to paste directly into your terminal.

### 1. Register users

```bash
# Register ADMIN (id → 4)
curl -s -X POST http://localhost:8080/users/accounts/register -H "Content-Type: application/json" -d '{"fullName":"Ahmed Admin","phoneNumber":"01012345678","age":30,"email":"ahmed.admin@bugtracker.com","password":"admin1234","role":"ADMIN"}'

# Register STAFF (id → 5)
curl -s -X POST http://localhost:8080/users/accounts/register -H "Content-Type: application/json" -d '{"fullName":"Sara Staff","phoneNumber":"01098765432","age":26,"email":"sara.staff@bugtracker.com","password":"staff1234","role":"STAFF","job":"BACKEND"}'

# Register CUSTOMER (id → 6)
curl -s -X POST http://localhost:8080/users/accounts/register -H "Content-Type: application/json" -d '{"fullName":"Omar Customer","phoneNumber":"01011112233","age":24,"email":"omar.customer@bugtracker.com","password":"customer1234","role":"CUSTOMER"}'
```

### 2. Login

```bash
# Login as ADMIN
curl -s -X POST http://localhost:8080/users/accounts/login -H "Content-Type: application/json" -d '{"email":"ahmed.admin@bugtracker.com","password":"admin1234"}'

# Login as STAFF
curl -s -X POST http://localhost:8080/users/accounts/login -H "Content-Type: application/json" -d '{"email":"sara.staff@bugtracker.com","password":"staff1234"}'

# Login as CUSTOMER
curl -s -X POST http://localhost:8080/users/accounts/login -H "Content-Type: application/json" -d '{"email":"omar.customer@bugtracker.com","password":"customer1234"}'
```

### 3. Create a project (ADMIN)

```bash
curl -s -X POST http://localhost:8080/projects/insert -H "Content-Type: application/json" -H "role: ADMIN" -d '{"projectName":"E-Commerce App","description":"Online shopping platform","adminId":4}'
```

### 4. Create a bug (CUSTOMER)

```bash
curl -s -X POST http://localhost:8080/bugs/insert -H "Content-Type: application/json" -H "userId: 6" -d '{"title":"Checkout button unresponsive","description":"Clicking checkout does nothing on mobile","priority":"HIGH","projectName":"E-Commerce App"}'
```

→ Admin (id 4) automatically receives an `UNREAD` notification.

### 5. Check notifications (ADMIN)

```bash
curl -s http://localhost:8080/notifications/my-notifications -H "userId: 4"
```

### 6. Assign bug to staff (ADMIN)

```bash
curl -s -X PUT http://localhost:8080/bugs/assign -H "Content-Type: application/json" -H "userId: 4" -d '{"bugId":2,"staffId":5}'
```

→ Staff (id 5) automatically receives an `UNREAD` notification.

### 7. Staff comment on bug

```bash
curl -s -X POST http://localhost:8080/bugs/comment -H "Content-Type: application/json" -H "userId: 5" -d '{"bugId":2,"adminId":4,"comment":"Reproduced on Safari iOS. Investigating event listener issue."}'
```

### 8. Admin message to customer

```bash
curl -s -X POST http://localhost:8080/bugs/admin-message -H "Content-Type: application/json" -H "userId: 4" -d '{"bugId":2,"customerId":6,"message":"Our team is actively working on your issue."}'
```

### 9. Solve bug (STAFF)

```bash
curl -s -X PUT http://localhost:8080/bugs/solve -H "Content-Type: application/json" -H "userId: 5" -d '{"bugId":2,"customerId":6}'
```

→ Customer (id 6) automatically receives an `UNREAD` notification.

### 10. Check customer notifications

```bash
curl -s http://localhost:8080/notifications/my-notifications -H "userId: 6"
```

### 11. Mark notification as read

```bash
curl -s -X PUT http://localhost:8080/notifications/read/4
```

### 12. Update bug status

```bash
curl -s -X PUT http://localhost:8080/bugs/2 -H "Content-Type: application/json" -H "userId: 4" -H "role: ADMIN" -d '{"title":"Checkout button unresponsive","description":"Fixed in v2.1","priority":"HIGH","status":"CLOSED"}'
```

---

## Bug Lifecycle

```
OPEN → ASSIGNED → IN_PROGRESS → FIXED → CLOSED
                             ↘ SOLVED
```

---

## Automatic Notifications Summary

| Trigger | Sender | Receiver | Message |
|---|---|---|---|
| Bug created | customer | project admin | `"New bug created"` |
| Bug assigned | admin | staff | `"This bug has been assigned to you"` |
| Bug solved | staff | customer | `"Bug has been solved"` |
| Staff comment | staff | admin | the comment text |
| Admin message | admin | customer | the message text |
