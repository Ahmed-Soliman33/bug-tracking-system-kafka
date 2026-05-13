# API Docs — Bug Tracker

> For frontend developers. Every request and response below was captured from a live running instance.

---

## Base URL

```
http://localhost:8080
```

Everything goes through the API Gateway. No service ports are called directly.

---

## How Auth Works

There is no JWT or session cookie. After login you get back a user object. Save `data.id` and `data.role` — attach them as plain headers on **every** request that needs them:

```
userId: 4
role: ADMIN
```

| Role | What they can do |
|---|---|
| `ADMIN` | Create projects, assign bugs, message customers, manage all users |
| `STAFF` | View and solve bugs assigned to them, comment on bugs |
| `CUSTOMER` | Create bugs, view own bugs, receive notifications |

---

## Endpoints

### Auth

---

#### `POST /users/accounts/register`

Create a new user account.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | string | yes | |
| `phoneNumber` | string | yes | |
| `age` | number | yes | 21–60 |
| `email` | string | yes | must be unique |
| `password` | string | yes | min 8 characters |
| `role` | string | yes | `ADMIN` `STAFF` `CUSTOMER` |
| `job` | string | STAFF only | `FRONTEND` `BACKEND` `FULLSTACK` `QA` `DEVOPS` `MOBILE` |

```json
{
  "fullName": "Ahmed Admin",
  "phoneNumber": "01012345678",
  "age": 30,
  "email": "ahmed.admin@bugtracker.com",
  "password": "admin1234",
  "role": "ADMIN"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "User Registered Successfully",
  "data": {
    "id": 4,
    "fullName": "Ahmed Admin",
    "phoneNumber": "01012345678",
    "age": 30,
    "email": "ahmed.admin@bugtracker.com",
    "password": "$2a$10$zK0s2M9u73C9fQWzvtWoH.Cx47x5YLwzhSPR9QPt5t6ZLuxjqyG8a",
    "role": "ADMIN"
  }
}
```

> Save `data.id` and `data.role` immediately — they are needed for every subsequent call.

---

#### `POST /users/accounts/login`

Authenticate an existing user.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

**Request body**

```json
{
  "email": "ahmed.admin@bugtracker.com",
  "password": "admin1234"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 4,
    "fullName": "Ahmed Admin",
    "phoneNumber": "01012345678",
    "age": 30,
    "email": "ahmed.admin@bugtracker.com",
    "password": "$2a$10$zK0s2M9u73C9fQWzvtWoH.Cx47x5YLwzhSPR9QPt5t6ZLuxjqyG8a",
    "role": "ADMIN"
  }
}
```

> Store `data.id` and `data.role` in `localStorage`. All protected endpoints need them as headers.

---

### Users

---

#### `GET /users`

Get all users. Admin only.

**Headers**

| Header | Value |
|---|---|
| `role` | `ADMIN` |

**Response `200`**

```json
[
  {
    "id": 4,
    "fullName": "Ahmed Admin",
    "phoneNumber": "01012345678",
    "age": 30,
    "email": "ahmed.admin@bugtracker.com",
    "password": "$2a$10$...",
    "role": "ADMIN"
  },
  {
    "id": 5,
    "fullName": "Sara Staff",
    "phoneNumber": "01098765432",
    "age": 26,
    "email": "sara.staff@bugtracker.com",
    "password": "$2a$10$...",
    "role": "STAFF",
    "job": null
  },
  {
    "id": 6,
    "fullName": "Omar Customer",
    "phoneNumber": "01011112233",
    "age": 24,
    "email": "omar.customer@bugtracker.com",
    "password": "$2a$10$...",
    "role": "CUSTOMER"
  }
]
```

---

#### `GET /users/{id}`

Get a single user by ID.

**Headers**

| Header | Value |
|---|---|
| `userId` | your user id |
| `role` | your role |

**Access rules**
- `ADMIN` → can fetch any user
- `STAFF` / `CUSTOMER` → can only fetch their own profile (userId must equal the path id)

**Response `200`**

```json
{
  "id": 6,
  "fullName": "Omar Customer",
  "phoneNumber": "01011112233",
  "age": 24,
  "email": "omar.customer@bugtracker.com",
  "password": "$2a$10$...",
  "role": "CUSTOMER"
}
```

**Response `403`** — trying to access another user's profile without admin role.

---

#### `PUT /users/{id}`

Update a user profile.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | your user id |
| `role` | your role |

**Access rules** — same as GET: ADMIN = any user, STAFF/CUSTOMER = own profile only.

**Request body** — all fields required, same shape as register:

```json
{
  "fullName": "Omar Customer Updated",
  "phoneNumber": "01011112233",
  "age": 25,
  "email": "omar.customer@bugtracker.com",
  "password": "newpassword1234",
  "role": "CUSTOMER"
}
```

**Response `200`** — no body returned.

---

#### `DELETE /users/{id}`

Delete a user. Admin only.

**Headers**

| Header | Value |
|---|---|
| `role` | `ADMIN` |

**Response `200`** — no body returned.

---

### Projects

---

#### `POST /projects/insert`

Create a new project. Admin only.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `role` | `ADMIN` |

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `projectName` | string | yes | must be unique |
| `description` | string | yes | |
| `adminId` | number | yes | ID of the admin who owns this project |

```json
{
  "projectName": "E-Commerce App",
  "description": "Online shopping platform",
  "adminId": 4
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Project Created Successfully",
  "data": {
    "projectId": 2,
    "projectName": "E-Commerce App",
    "description": "Online shopping platform",
    "adminId": 4
  }
}
```

---

#### `GET /projects`

Get all projects. No headers required.

**Response `200`**

```json
[
  {
    "projectId": 1,
    "projectName": "Test Project",
    "description": "A test project",
    "adminId": 1
  },
  {
    "projectId": 2,
    "projectName": "E-Commerce App",
    "description": "Online shopping platform",
    "adminId": 4
  }
]
```

---

#### `GET /projects/{projectId}`

Get a project by numeric ID.

**Response `200`**

```json
{
  "projectId": 2,
  "projectName": "E-Commerce App",
  "description": "Online shopping platform",
  "adminId": 4
}
```

---

#### `GET /projects/name/{projectName}`

Get a project by its exact name. URL-encode spaces as `%20`.

```
GET /projects/name/E-Commerce%20App
```

**Response `200`** — same shape as get by ID.

---

#### `PUT /projects/{id}`

Update a project.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

**Request body**

```json
{
  "projectName": "E-Commerce App v2",
  "description": "Updated description",
  "adminId": 4
}
```

**Response `200`** — updated project object.

---

#### `DELETE /projects/{id}`

Delete a project. Admin only.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |

**Request body** — role as a raw JSON string:

```json
"ADMIN"
```

**Response `200`** — no body returned.

---

### Bugs

---

#### `POST /bugs/insert`

Report a new bug. Called by CUSTOMER.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | customer's id |

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `description` | string | no | |
| `priority` | string | yes | `LOW` `MEDIUM` `HIGH` `CRITICAL` |
| `projectName` | string | yes | must exactly match an existing project name |

```json
{
  "title": "Checkout button unresponsive",
  "description": "Clicking checkout does nothing on mobile browsers",
  "priority": "HIGH",
  "projectName": "E-Commerce App"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Bug created Successfully",
  "data": {
    "id": 2,
    "title": "Checkout button unresponsive",
    "description": "Clicking checkout does nothing on mobile browsers",
    "priority": "HIGH",
    "projectName": "E-Commerce App",
    "status": "OPEN",
    "customerId": 6,
    "assignedStaffId": null
  }
}
```

> Automatically sends an `UNREAD` notification to the project's admin.

---

#### `GET /bugs`

Get all bugs. No headers required.

**Response `200`**

```json
[
  {
    "id": 1,
    "title": "App crashes on login",
    "description": "Clicking login causes a 500 error",
    "priority": "HIGH",
    "projectName": "Test Project",
    "status": "SOLVED",
    "customerId": 2,
    "assignedStaffId": 3
  },
  {
    "id": 2,
    "title": "Checkout button unresponsive",
    "description": "Clicking checkout does nothing on mobile browsers",
    "priority": "HIGH",
    "projectName": "E-Commerce App",
    "status": "OPEN",
    "customerId": 6,
    "assignedStaffId": null
  }
]
```

---

#### `GET /bugs/{bugId}`

Get a single bug by ID.

**Headers**

| Header | Value |
|---|---|
| `userId` | your user id |
| `role` | your role |

**Access rules**
- `ADMIN` → any bug
- `STAFF` → only bugs where `assignedStaffId` matches their id
- `CUSTOMER` → only bugs where `customerId` matches their id

**Response `200`**

```json
{
  "id": 2,
  "title": "Checkout button unresponsive",
  "description": "Clicking checkout does nothing on mobile browsers",
  "priority": "HIGH",
  "projectName": "E-Commerce App",
  "status": "OPEN",
  "customerId": 6,
  "assignedStaffId": null
}
```

---

#### `PUT /bugs/assign`

Assign a bug to a staff member. Admin only. Bug must be in `OPEN` status.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | admin's id |

**Request body**

| Field | Type | Notes |
|---|---|---|
| `bugId` | number | ID of the bug to assign |
| `staffId` | number | ID of the staff member to assign to |

```json
{
  "bugId": 2,
  "staffId": 5
}
```

**Response `200`**

```json
{
  "id": 2,
  "title": "Checkout button unresponsive",
  "description": "Clicking checkout does nothing on mobile browsers",
  "priority": "HIGH",
  "projectName": "E-Commerce App",
  "status": "ASSIGNED",
  "customerId": 6,
  "assignedStaffId": 5
}
```

> Automatically sends an `UNREAD` notification to the assigned staff member.

---

#### `PUT /bugs/solve`

Mark a bug as solved. Staff only. Only the assigned staff member can solve the bug.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | staff's id |

**Request body**

| Field | Type | Notes |
|---|---|---|
| `bugId` | number | ID of the bug to solve |
| `customerId` | number | ID of the customer who reported it (for notification) |

```json
{
  "bugId": 2,
  "customerId": 6
}
```

**Response `200`**

```json
{
  "id": 2,
  "title": "Checkout button unresponsive",
  "description": "Clicking checkout does nothing on mobile browsers",
  "priority": "HIGH",
  "projectName": "E-Commerce App",
  "status": "SOLVED",
  "customerId": 6,
  "assignedStaffId": 5
}
```

> Automatically sends an `UNREAD` notification to the customer.

---

#### `POST /bugs/comment`

Staff sends a comment about a bug to the admin (delivered as a notification).

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | staff's id |

**Request body**

| Field | Type | Notes |
|---|---|---|
| `bugId` | number | |
| `adminId` | number | ID of the admin to notify |
| `comment` | string | the comment text |

```json
{
  "bugId": 2,
  "adminId": 4,
  "comment": "Reproduced on Safari iOS. Investigating event listener issue."
}
```

**Response `200`** — no body returned.

---

#### `POST /bugs/admin-message`

Admin sends a message about a bug to the customer (delivered as a notification).

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | admin's id |

**Request body**

| Field | Type | Notes |
|---|---|---|
| `bugId` | number | |
| `customerId` | number | ID of the customer to notify |
| `message` | string | the message text |

```json
{
  "bugId": 2,
  "customerId": 6,
  "message": "Our team is actively working on your issue."
}
```

**Response `200`** — no body returned.

---

#### `PUT /bugs/{id}`

Update a bug's details or status.

**Headers**

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `userId` | your user id |
| `role` | your role |

**Access rules** — same as GET bug by ID.

**Request body**

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `description` | string | |
| `priority` | string | `LOW` `MEDIUM` `HIGH` `CRITICAL` |
| `status` | string | `OPEN` `ASSIGNED` `IN_PROGRESS` `FIXED` `SOLVED` `CLOSED` |

```json
{
  "title": "Checkout button unresponsive",
  "description": "Fixed in v2.1 - event listener was blocked by ad blocker",
  "priority": "HIGH",
  "status": "CLOSED"
}
```

**Response `200`**

```json
{
  "id": 2,
  "title": "Checkout button unresponsive",
  "description": "Fixed in v2.1 - event listener was blocked by ad blocker",
  "priority": "HIGH",
  "projectName": "E-Commerce App",
  "status": "CLOSED",
  "customerId": 6,
  "assignedStaffId": 5
}
```

---

#### `DELETE /bugs/{id}`

Delete a bug.

**Headers**

| Header | Value |
|---|---|
| `userId` | your user id |
| `role` | your role |

**Access rules** — same as GET bug by ID.

**Response `200`** — no body returned.

---

### Notifications

Notifications are created automatically — the frontend only reads and marks them.

---

#### `GET /notifications/my-notifications`

Get all notifications for the logged-in user (both READ and UNREAD).

**Headers**

| Header | Value |
|---|---|
| `userId` | your user id |

**Response `200`**

```json
[
  {
    "id": 4,
    "senderId": 6,
    "receiverId": 4,
    "message": "New bug created",
    "bugId": 2,
    "status": "UNREAD",
    "createdAt": "2026-05-09T01:45:25.123832"
  },
  {
    "id": 7,
    "senderId": 4,
    "receiverId": 6,
    "message": "Our team is actively working on your issue.",
    "bugId": 2,
    "status": "UNREAD",
    "createdAt": "2026-05-09T01:45:39.240348"
  }
]
```

---

#### `PUT /notifications/read/{id}`

Mark a notification as read.

**No headers required.**

**Response `200`**

```json
{
  "id": 4,
  "senderId": 6,
  "receiverId": 4,
  "message": "New bug created",
  "bugId": 2,
  "status": "READ",
  "createdAt": "2026-05-09T01:45:25.123832"
}
```

---

## Data Models

### User

```json
{
  "id": 4,
  "fullName": "Ahmed Admin",
  "phoneNumber": "01012345678",
  "age": 30,
  "email": "ahmed.admin@bugtracker.com",
  "password": "$2a$10$...",
  "role": "ADMIN"
}
```

> `password` is always BCrypt-hashed. Never display it in the UI.

### Project

```json
{
  "projectId": 2,
  "projectName": "E-Commerce App",
  "description": "Online shopping platform",
  "adminId": 4
}
```

### Bug

```json
{
  "id": 2,
  "title": "Checkout button unresponsive",
  "description": "Clicking checkout does nothing on mobile browsers",
  "priority": "HIGH",
  "projectName": "E-Commerce App",
  "status": "OPEN",
  "customerId": 6,
  "assignedStaffId": null
}
```

**priority values:** `LOW` `MEDIUM` `HIGH` `CRITICAL`

**status values:** `OPEN` `ASSIGNED` `IN_PROGRESS` `FIXED` `SOLVED` `CLOSED`

### Notification

```json
{
  "id": 5,
  "senderId": 4,
  "receiverId": 5,
  "message": "This bug has been assigned to you",
  "bugId": 2,
  "status": "UNREAD",
  "createdAt": "2026-05-09T01:45:38.801449"
}
```

**status values:** `UNREAD` `READ`

---

## Automatic Notifications

These are triggered by backend actions — no frontend call needed.

| Action | Triggered by | Notifies | Message |
|---|---|---|---|
| Bug created | `POST /bugs/insert` | project admin | `"New bug created"` |
| Bug assigned | `PUT /bugs/assign` | assigned staff | `"This bug has been assigned to you"` |
| Bug solved | `PUT /bugs/solve` | customer | `"Bug has been solved"` |
| Staff comment | `POST /bugs/comment` | admin | the comment text |
| Admin message | `POST /bugs/admin-message` | customer | the message text |

---

## Error Responses

**`403 Forbidden`** — wrong role or trying to access another user's resource:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied"
}
```

**`404 Not Found`** — resource does not exist:

```json
{
  "timestamp": "2026-05-09T01:35:10.123",
  "status": 404,
  "error": "Project Not Found",
  "message": "Project not found",
  "path": "/projects/name/Unknown"
}
```

**`500 Internal Server Error`** — malformed request body (missing required fields, wrong JSON):

```json
{
  "timestamp": "2026-05-09T01:39:17.626118385",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Required request body is missing"
}
```

> If you get a 500 on a POST, check that your `Content-Type: application/json` header is set and the body is valid JSON on a **single line** in the terminal.

---

## Quick Reference

| What | Method | Path | Key Headers |
|---|---|---|---|
| Register | POST | `/users/accounts/register` | — |
| Login | POST | `/users/accounts/login` | — |
| Get all users | GET | `/users` | `role: ADMIN` |
| Get user | GET | `/users/{id}` | `userId`, `role` |
| Update user | PUT | `/users/{id}` | `userId`, `role` |
| Delete user | DELETE | `/users/{id}` | `role: ADMIN` |
| Create project | POST | `/projects/insert` | `role: ADMIN` |
| Get all projects | GET | `/projects` | — |
| Get project by ID | GET | `/projects/{id}` | — |
| Get project by name | GET | `/projects/name/{name}` | — |
| Update project | PUT | `/projects/{id}` | — |
| Delete project | DELETE | `/projects/{id}` | — |
| Create bug | POST | `/bugs/insert` | `userId` (customer) |
| Get all bugs | GET | `/bugs` | — |
| Get bug | GET | `/bugs/{id}` | `userId`, `role` |
| Assign bug | PUT | `/bugs/assign` | `userId` (admin) |
| Solve bug | PUT | `/bugs/solve` | `userId` (staff) |
| Staff comment | POST | `/bugs/comment` | `userId` (staff) |
| Admin message | POST | `/bugs/admin-message` | `userId` (admin) |
| Update bug | PUT | `/bugs/{id}` | `userId`, `role` |
| Delete bug | DELETE | `/bugs/{id}` | `userId`, `role` |
| My notifications | GET | `/notifications/my-notifications` | `userId` |
| Mark as read | PUT | `/notifications/read/{id}` | — |
