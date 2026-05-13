# SYSTEM_FIX_PLAN.md — Bug Tracking System (Kafka Edition)

> **16 issues identified. 4 phases. Execute one phase at a time, verify before proceeding.**

---

## Phase 1 — Infrastructure & Kafka Configs
*Goal: Make Kafka reachable inside Docker. Without this, no async event fires at all.*

| # | File | Problem | Fix |
|---|---|---|---|
| 7a | `Bug-Service/Config/KafkaProducerConfig.java` | Hardcodes `localhost:9092`, overrides `application.properties` | Delete the file — Spring Boot auto-configures from properties |
| 7b | `Notification-Service/Config/KafkaConsumerConfig.java` | Hardcodes `localhost:9092`, overrides `application.properties` | Delete the file — Spring Boot auto-configures from properties |
| 7c | `User-Auth-Service/Config/KafkaProducerConfig.java` | Hardcodes `localhost:9092`, overrides `application.properties` | Delete the file — Spring Boot auto-configures from properties |
| 7d | `User-Auth-Service/application.yml` | Has a second `bootstrap-servers: localhost:9092` that conflicts with `.properties` | Delete or empty the `.yml` — `.properties` already has the correct `kafka:9092` |

**Services to rebuild after Phase 1:** `bug-service`, `notification-service`, `user-auth-service`

**Verify:** Kafka UI at `http://localhost:9085` — after creating a bug, topics `bug-created-topic` etc. must appear with messages.

---

## Phase 2 — Backend API Contracts
*Goal: Fix every HTTP contract issue so the frontend can actually talk to the backend.*

| # | File | Problem | Fix |
|---|---|---|---|
| 1 | `Notification-Service/Controller/NotificationController.java` | GET endpoint is `/userNotifications`, frontend calls `/my-notifications` | Rename mapping to `/my-notifications` |
| 2 | `Bug-Service/Controller/BugController.java` (getAllBugs) | Requires unused `@RequestHeader Long id` that frontend doesn't send | Remove the `@RequestHeader` parameter entirely |
| 3 | `Bug-Service/Controller/BugController.java` (getBugById) | GET uses `@RequestBody` — browser fetch drops it | Move `userId` + `role` to `@RequestHeader` |
| 4 | `Bug-Service/Controller/BugController.java` (updateBug) | Two `@RequestBody` params — Spring can't bind both | Move `userId` + `role` to `@RequestHeader`, keep `Bug` as the single body |
| 5 | `Bug-Service/Controller/BugController.java` (deleteBug) | DELETE uses `@RequestBody` — frontend never sends one | Move `userId` + `role` to `@RequestHeader` |
| 11 | `Project-Service/Controller/ProjectController.java` | Two `@GetMapping("/{x}")` clash, and `@PathVariable String name` doesn't match `{projectName}` | Remove the broken duplicate; keep only `GET /projects/name/{projectName}` |
| 12a | `Project-Service/Controller/ProjectController.java` | `@PostMapping` maps to `POST /projects`, frontend calls `POST /projects/insert` | Change to `@PostMapping("/insert")` |

**Services to rebuild after Phase 2:** `bug-service`, `notification-service`, `project-service`

**Verify with curl:**
```bash
# Notifications
curl http://localhost:9080/notifications/my-notifications -H "userId: 1"

# All bugs (no extra header needed)
curl http://localhost:9080/bugs

# Get single bug (headers only, no body)
curl http://localhost:9080/bugs/1 -H "userId: 1" -H "role: ADMIN"

# Create project
curl -X POST http://localhost:9080/projects/insert \
  -H "Content-Type: application/json" -H "role: ADMIN" \
  -d '{"projectName":"Test","description":"desc","adminId":1}'
```

---

## Phase 3 — Kafka Event Logic & Notifications
*Goal: Fix wrong IDs, hardcoded strings, missing bugIds, and bad default status.*

| # | File | Problem | Fix |
|---|---|---|---|
| 6 | `Bug-Service/Service/BugServiceImpl.java` | `BugAssignedEvent(bugId, adminId, staffId)` — args in wrong order for the DTO constructor | Fix to `BugAssignedEvent(bugId, staffId, adminId)` |
| 8 | `Bug-Service/Service/BugServiceImpl.java` | `adminMessage()` sends hardcoded `"Bug Assigned to you"` instead of the actual `message` param | Replace with the `message` variable |
| 9 | `Notification-Service/service/NotificationServiceImpl.java` | `notifyCustomerBugSolved` creates notification as `Status.READ` | Change to `Status.UNREAD` |
| 10a | `Notification-Service/service/NotificationServiceImpl.java` | `notifyAdminNewBug` never sets `bugId` on notification | Add `notification.setBugId(event.getBugId())` |
| 10b | `Notification-Service/service/NotificationServiceImpl.java` | `notifyStaffBugAssigned` never sets `bugId` | Add `notification.setBugId(event.getBugId())` |
| 10c | `Notification-Service/service/NotificationServiceImpl.java` | `notifyCustomerBugSolved` never sets `bugId` | Add `notification.setBugId(event.getBugId())` |
| 10d | `Notification-Service/service/NotificationServiceImpl.java` | `notifyAdminNewComment` never sets `bugId` | Add `notification.setBugId(event.getBugId())` |
| 10e | `Notification-Service/service/NotificationServiceImpl.java` | `notifyCustomerAdminMessage` never sets `bugId` | Add `notification.setBugId(event.getBugId())` |

**Services to rebuild after Phase 3:** `bug-service`, `notification-service`

**Verify:** After assigning a bug, check Kafka UI that `bug-assigned-topic` message has `staffId` and `adminId` in the right fields. Check the DB (or GET notifications) that the notification `receiverId` is the staff member, not the admin.

---

## Phase 4 — Frontend Alignment & UI Polish
*Goal: Fix the BASE_URL mismatch, unblock the comment button, add missing filter, and stub out the project detail page.*

| # | File | Problem | Fix |
|---|---|---|---|
| 13 | `frontend/src/lib/api.js` | `BASE_URL = 'http://localhost:8080'` but gateway runs on `:9080` | Change to `http://localhost:9080` |
| 14 | `frontend/src/App.jsx` | `ProjectDetailPage` is an inline stub — route exists but is useless | Implement a real `ProjectDetailPage` that shows project info and its bugs |
| 15 | `frontend/src/pages/admin/AllBugsPage.jsx` | `FIXED` status missing from filter button list | Add `"FIXED"` to the status filter array |
| 16 | `frontend/src/pages/shared/BugDetailPage.jsx` | Comment button is permanently disabled if `projectData` fetch is slow/fails | Show loading spinner on button instead of permanently disabling |

**No rebuild needed — Vite hot-reloads. Restart `npm run dev` if BASE_URL change doesn't take.**

**Verify:**
- Login → dashboard loads data (BASE_URL fix)
- Admin: create bug → notification fires to admin → notification is clickable and navigates to bug
- Staff: comment button is not stuck disabled
- Admin: `AllBugsPage` filter shows "FIXED" button
- Admin: clicking a project's external-link icon shows real project detail

---

## Execution Checklist

| Phase | Status |
|---|---|
| Phase 1 — Infrastructure & Kafka Configs | ✅ Done |
| Phase 2 — Backend API Contracts | ✅ Done |
| Phase 3 — Kafka Event Logic & Notifications | ✅ Done |
| Phase 4 — Frontend Alignment & UI Polish | ✅ Done |
