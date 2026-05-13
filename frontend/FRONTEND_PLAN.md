# Bug Tracker — Frontend Development Master Plan

> **Scope:** English-only, LTR, enterprise-grade dashboard. No code — architecture, wireframes, and roadmap only.

---

## 1. Tech Stack & Architecture Summary

| Concern | Tool | Role |
|---|---|---|
| Framework | React 18 (Vite, JS) | Component tree, JSX rendering |
| Routing | react-router-dom v7 | Client-side navigation, protected routes |
| Global State | Zustand + js-cookie | Auth session (persisted in cookies, 7-day expiry) |
| Server State | @tanstack/react-query v5 | API data fetching, caching, loading/error states |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first layout and spacing |
| UI Components | Shadcn UI (style: Default, CSS vars) | Accessible, composable primitives |
| Animation | framer-motion | Page transitions, micro-interactions |
| Forms | react-hook-form + @hookform/resolvers + zod | Schema validation, controlled forms |
| Icons | lucide-react | Consistent icon set |
| Networking | Native `fetch` via `src/lib/api.js` | Auto-injects `userId` + `role` headers from Zustand |

**Auth model:** No JWT. On login, the API returns `data.id` and `data.role`. These are stored in `useAuthStore` and injected as HTTP headers on every request by `api.js` via `useAuthStore.getState()`.

**Roles:** `ADMIN` · `STAFF` · `CUSTOMER`

---

## 2. Global Layout Architecture

### 2.1 Layout Shells

Each role has a dedicated layout wrapper in `src/components/layout/`. All layouts share the same structural skeleton but differ in navigation items and available actions.

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixed, 240px)    │  MAIN AREA (flex-1)            │
│                            │                                  │
│  ┌──────────────────────┐  │  ┌──────────────────────────┐  │
│  │  Logo + App Name     │  │  │  TOP NAVBAR (sticky)     │  │
│  └──────────────────────┘  │  │  Breadcrumb | Bell | Ava │  │
│                            │  └──────────────────────────┘  │
│  ┌──────────────────────┐  │                                  │
│  │  NAV SECTION         │  │  ┌──────────────────────────┐  │
│  │  • Nav Item          │  │  │                          │  │
│  │  • Nav Item (active) │  │  │   PAGE CONTENT SLOT      │  │
│  │  • Nav Item          │  │  │   (scrollable)           │  │
│  │  • Nav Item          │  │  │                          │  │
│  └──────────────────────┘  │  └──────────────────────────┘  │
│                            │                                  │
│  ┌──────────────────────┐  │                                  │
│  │  USER CARD           │  │                                  │
│  │  Name · Role badge   │  │                                  │
│  │  Logout button       │  │                                  │
│  └──────────────────────┘  │                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Sidebar Navigation by Role

**AdminLayout** — nav items:
- Dashboard
- Projects (manage + create)
- All Bugs (full list, assign)
- Users (manage)
- Notifications

**StaffLayout** — nav items:
- Dashboard
- My Assigned Bugs
- Notifications

**CustomerLayout** — nav items:
- Dashboard
- My Bugs (list + create)
- Notifications

### 2.3 Top Navbar

```
┌──────────────────────────────────────────────────────────────┐
│  > Dashboard > Bugs > Bug #42          [🔔 3]  [Avatar ▾]   │
└──────────────────────────────────────────────────────────────┘
```

- Left: Dynamic breadcrumb (`Breadcrumb` Shadcn component)
- Right: Notification bell with unread badge (`Badge`) + Avatar dropdown (`DropdownMenu`) with profile link and logout

### 2.4 Public Layout (Auth pages)

No sidebar. Centered card on a branded background. Used for `/login` and `/register`.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  [Logo]  Bug Tracker                        │
│                                                             │
│            ┌─────────────────────────────┐                 │
│            │    AUTH CARD (Shadcn Card)  │                 │
│            │                             │                 │
│            │    [form content]           │                 │
│            │                             │                 │
│            └─────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Page Inventory & Routing

### 3.1 Route Table

```
/                          → redirect to /login (or role dashboard if logged in)

── AUTH (no layout) ───────────────────────────────────────────
/login                     → LoginPage
/register                  → RegisterPage

── ADMIN (/admin/*) ────────────────────────────────────────────
/admin/dashboard           → AdminDashboard
/admin/projects            → ProjectsListPage
/admin/projects/new        → CreateProjectPage
/admin/projects/:id        → ProjectDetailPage
/admin/bugs                → AllBugsPage
/admin/bugs/:id            → BugDetailPage  (admin view)
/admin/users               → UsersListPage
/admin/notifications       → NotificationsPage

── STAFF (/staff/*) ─────────────────────────────────────────────
/staff/dashboard           → StaffDashboard
/staff/bugs                → MyAssignedBugsPage
/staff/bugs/:id            → BugDetailPage  (staff view)
/staff/notifications       → NotificationsPage

── CUSTOMER (/customer/*) ──────────────────────────────────────
/customer/dashboard        → CustomerDashboard
/customer/bugs             → MyBugsPage
/customer/bugs/new         → CreateBugPage
/customer/bugs/:id         → BugDetailPage  (customer view)
/customer/notifications    → NotificationsPage
```

### 3.2 Route Protection Strategy

- `ProtectedRoute` component reads `useAuthStore`.
- If `user === null` → redirect to `/login`.
- If `user.role` does not match the route prefix → redirect to the correct role's dashboard.
- Login/Register redirect to the role-appropriate dashboard if already authenticated.

---

## 4. Detailed Text-Based Wireframes

> Shadcn components named in `[brackets]`. All pages live inside their role's layout shell unless marked **[Public Layout]**.

---

### 4.1 Login Page `[Public Layout]`

**Route:** `/login`

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    🐛  Bug Tracker                           │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  [Card]                                              │  │
│   │                                                      │  │
│   │   Sign in to your account                           │  │
│   │   ─────────────────────────────                     │  │
│   │                                                      │  │
│   │   Email address                                      │  │
│   │   [Input]  user@example.com                         │  │
│   │                                                      │  │
│   │   Password                                           │  │
│   │   [Input type=password]  ••••••••         [👁 show] │  │
│   │                                                      │  │
│   │   [Button — full width]  Sign In                    │  │
│   │                                                      │  │
│   │   ──────────────────────────────────────────        │  │
│   │   Don't have an account?  [Link → /register]        │  │
│   │                                                      │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `CardHeader`, `CardContent`, `Input`, `Button`, `Label`
**Logic:** `react-hook-form` + `zod` (email format, min 8 chars password). On success, call `setUser(data)` in Zustand, redirect to role dashboard. Show inline `[Alert destructive]` on failure.

---

### 4.2 Register Page `[Public Layout]`

**Route:** `/register`

```
┌──────────────────────────────────────────────────────────────┐
│   ┌──────────────────────────────────────────────────────┐  │
│   │  [Card]   Create your account                        │  │
│   │  ─────────────────────────────────────────────────   │  │
│   │                                                      │  │
│   │   Full Name          Phone Number                    │  │
│   │   [Input]            [Input]                         │  │
│   │                                                      │  │
│   │   Age                Role                            │  │
│   │   [Input number]     [Select: ADMIN/STAFF/CUSTOMER]  │  │
│   │                                                      │  │
│   │   ── shown only when Role = STAFF ──────────────     │  │
│   │   Job Type                                           │  │
│   │   [Select: FRONTEND/BACKEND/FULLSTACK/QA/DEVOPS/     │  │
│   │            MOBILE]                                   │  │
│   │                                                      │  │
│   │   Email                                              │  │
│   │   [Input]                                            │  │
│   │                                                      │  │
│   │   Password                                           │  │
│   │   [Input type=password]                              │  │
│   │                                                      │  │
│   │   [Button — full width]  Create Account              │  │
│   │                                                      │  │
│   │   Already have an account?  [Link → /login]          │  │
│   └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Input`, `Select`, `SelectItem`, `Button`, `Label`, `Alert`
**Logic:** Conditional `job` field rendered when `role === 'STAFF'`. Zod schema with discriminated union for role. Min age 21, max 60.

---

### 4.3 Admin Dashboard

**Route:** `/admin/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, Ahmed.            Friday, May 09, 2026       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STATS ROW  [4 × Card]                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Total    │ │  Open    │ │ Assigned │ │ Solved   │      │
│  │ Bugs     │ │  Bugs    │ │  Bugs    │ │  Bugs    │      │
│  │   142    │ │   38     │ │   61     │ │   43     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌─────────────────────────────┐ ┌───────────────────────┐ │
│  │ RECENT BUGS  [Card]         │ │ PROJECTS  [Card]       │ │
│  │                             │ │                       │ │
│  │ [Table — compact]           │ │ [List of projects     │ │
│  │  Title | Priority | Status  │ │  with bug counts]     │ │
│  │  ────────────────────────   │ │                       │ │
│  │  Bug A  HIGH      OPEN      │ │  E-Commerce App   23  │ │
│  │  Bug B  MED       ASSIGNED  │ │  Mobile App       11  │ │
│  │  Bug C  LOW       SOLVED    │ │  Admin Portal     8   │ │
│  │                             │ │                       │ │
│  │  [Button: View All Bugs]    │ │  [Button: New Project]│ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                             │
│  UNREAD NOTIFICATIONS  [Card]                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔔 Customer Ziad opened bug "Login fails on iOS"   │   │
│  │  🔔 Staff Sara commented on bug #88                 │   │
│  │  [Button: View All]                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `CardHeader`, `CardContent`, `Badge`, `Table`, `Button`, `Separator`

---

### 4.4 Staff Dashboard

**Route:** `/staff/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│  My Work Queue                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STATS ROW  [3 × Card]                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Assigned    │  │  In Progress │  │  Solved      │      │
│  │  to Me       │  │              │  │  by Me       │      │
│  │     12       │  │      5       │  │     31       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  MY ASSIGNED BUGS  [Card]                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Table]                                            │   │
│  │  Title          | Project       | Priority | Status │   │
│  │  ───────────────────────────────────────────────    │   │
│  │  Bug title here   E-Commerce     HIGH      ASSIGNED │   │
│  │  Another bug      Mobile App     MED       ASSIGNED │   │
│  │                                                     │   │
│  │  [Button: Solve]  per row (opens confirm Dialog)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Table`, `TableRow`, `Badge`, `Button`, `Dialog`

---

### 4.5 Customer Dashboard

**Route:** `/customer/dashboard`

```
┌─────────────────────────────────────────────────────────────┐
│  My Bug Reports                    [Button: + Report a Bug] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STATS ROW  [3 × Card]                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Submitted   │  │  In Progress │  │  Resolved    │      │
│  │     18       │  │      7       │  │     11       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  RECENT BUGS  [Card]                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Table — compact]                                  │   │
│  │  Title           | Priority | Status   | Project    │   │
│  │  Login fails iOS   HIGH      ASSIGNED   Mobile App  │   │
│  │  Cart bug          MED       OPEN       E-Commerce  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Table`, `Badge`, `Button`

---

### 4.6 All Bugs Page (Admin)

**Route:** `/admin/bugs`

```
┌─────────────────────────────────────────────────────────────┐
│  All Bugs                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FILTERS BAR                                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ [Input: Search by title...]  [Select: Status ▾]   │    │
│  │ [Select: Priority ▾]         [Select: Project ▾]  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  DATA TABLE  [Card > Table]                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ID  │ Title         │ Project     │ Pri  │ Status  │    │
│  │     │               │             │      │  [Badge]│    │
│  │─────┼───────────────┼─────────────┼──────┼─────────│    │
│  │  1  │ Login fails…  │ Mobile App  │ HIGH │ OPEN    │    │
│  │  2  │ Cart empty…   │ E-Commerce  │ MED  │ASSIGNED │    │
│  │  3  │ PDF export…   │ Admin Portal│ LOW  │ SOLVED  │    │
│  │                                                    │    │
│  │  [Row click → /admin/bugs/:id]                     │    │
│  │  [Row action: Assign Staff — opens Sheet/Dialog]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  [Pagination — prev / 1 2 3 … / next]                      │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Table`, `TableHeader`, `TableRow`, `TableCell`, `Badge`, `Input`, `Select`, `Button`, `Sheet` (assign panel), `Pagination`

---

### 4.7 Bug Detail Page

**Route:** `/admin/bugs/:id` · `/staff/bugs/:id` · `/customer/bugs/:id`

Sections rendered conditionally based on role.

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Bugs            Bug #42                          │
│  [Badge: HIGH]  [Badge: ASSIGNED]                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────┐  ┌──────────────────────┐ │
│  │ BUG INFO  [Card]            │  │ META  [Card]          │ │
│  │                             │  │                      │ │
│  │ Title: Login fails on iOS   │  │ Project: Mobile App  │ │
│  │                             │  │ Customer ID: 6       │ │
│  │ Description:                │  │ Assigned Staff: Sara │ │
│  │ Clicking login on Safari    │  │ Priority: HIGH       │ │
│  │ throws a 500 error…         │  │ Status: ASSIGNED     │ │
│  │                             │  │                      │ │
│  └─────────────────────────────┘  └──────────────────────┘ │
│                                                             │
│  ── ADMIN ACTIONS ─────────────────────────────────────     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Assign to Staff:  [Select staff member]            │   │
│  │  [Button: Assign Bug]                               │   │
│  │                                                     │   │
│  │  Message to Customer:  [Textarea]                   │   │
│  │  [Button: Send Message]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── STAFF ACTIONS ─────────────────────────────────────     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Comment to Admin:  [Textarea]                      │   │
│  │  [Button: Post Comment]                             │   │
│  │                                                     │   │
│  │  Customer ID (to notify):  [Input]                  │   │
│  │  [Button: Mark as Solved]  (confirm Dialog)         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ── ACTIVITY / NOTIFICATIONS ──────────────────────────     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Card — scrollable list]                           │   │
│  │  🔔 Admin assigned bug to Sara        10:32 AM      │   │
│  │  🔔 Sara commented: "Looking into it" 11:14 AM      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Badge`, `Separator`, `Textarea`, `Input`, `Select`, `Button`, `Dialog` (confirm solve), `ScrollArea`

---

### 4.8 Create Bug Page (Customer)

**Route:** `/customer/bugs/new`

```
┌─────────────────────────────────────────────────────────────┐
│  Report a New Bug                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Card — Form Card]                                 │   │
│  │                                                     │   │
│  │  Bug Title *                                        │   │
│  │  [Input]  Short, descriptive title                  │   │
│  │                                                     │   │
│  │  Project *                                          │   │
│  │  [Select → fetched from GET /projects]              │   │
│  │                                                     │   │
│  │  Priority *                                         │   │
│  │  [Select: LOW / MEDIUM / HIGH / CRITICAL]           │   │
│  │                                                     │   │
│  │  Description                                        │   │
│  │  [Textarea]  Steps to reproduce, expected vs actual │   │
│  │                                                     │   │
│  │  [Button: Submit Bug Report]   [Button: Cancel]     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`, `Input`, `Select`, `Textarea`, `Button`
**Logic:** Zod schema requires title, projectName (string), priority. On success, navigate to `/customer/bugs` and show `toast` confirmation.

---

### 4.9 Projects List Page (Admin)

**Route:** `/admin/projects`

```
┌─────────────────────────────────────────────────────────────┐
│  Projects                          [Button: + New Project]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Input: Search projects...]                                │
│                                                             │
│  PROJECTS GRID  [3-column grid of Cards]                    │
│  ┌───────────────────┐ ┌───────────────────┐               │
│  │ [Card]            │ │ [Card]            │               │
│  │ E-Commerce App    │ │ Mobile App        │               │
│  │                   │ │                   │               │
│  │ Online shopping   │ │ iOS & Android     │               │
│  │ platform          │ │ client app        │               │
│  │                   │ │                   │               │
│  │ Admin: Ahmed      │ │ Admin: Ahmed      │               │
│  │ Bugs: 23          │ │ Bugs: 11          │               │
│  │                   │ │                   │               │
│  │ [Edit] [Delete]   │ │ [Edit] [Delete]   │               │
│  └───────────────────┘ └───────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Input`, `Button`, `AlertDialog` (delete confirm)

---

### 4.10 Create Project Page (Admin)

**Route:** `/admin/projects/new`

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Project                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Card — Form Card]                                 │   │
│  │                                                     │   │
│  │  Project Name *     (must be unique)                │   │
│  │  [Input]                                            │   │
│  │                                                     │   │
│  │  Description *                                      │   │
│  │  [Textarea]                                         │   │
│  │                                                     │   │
│  │  Admin ID *                                         │   │
│  │  [Input number]  (auto-filled from logged-in user)  │   │
│  │                                                     │   │
│  │  [Button: Create Project]   [Button: Cancel]        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Form`, `FormField`, `Input`, `Textarea`, `Button`

---

### 4.11 Users List Page (Admin)

**Route:** `/admin/users`

```
┌─────────────────────────────────────────────────────────────┐
│  User Management                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FILTERS                                                    │
│  [Input: Search by name/email]   [Select: Role ▾]          │
│                                                             │
│  DATA TABLE  [Card > Table]                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Name        │ Email              │ Role      │ Age   │  │
│  │─────────────┼────────────────────┼───────────┼───────│  │
│  │ Ahmed A.    │ ahmed@…            │ [ADMIN]   │  30   │  │
│  │ Sara S.     │ sara@…             │ [STAFF]   │  26   │  │
│  │ Ziad Z.     │ ziad@…             │ [CUSTOMER]│  24   │  │
│  │                                                      │  │
│  │  Row actions: [View]  [Delete]                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Card`, `Table`, `Badge`, `Input`, `Select`, `Button`, `AlertDialog`

---

### 4.12 Notifications Page (All Roles)

**Route:** `/admin/notifications` · `/staff/notifications` · `/customer/notifications`

```
┌─────────────────────────────────────────────────────────────┐
│  Notifications                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tabs: All | Unread]                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Card — notification item]                         │   │
│  │  🔔  "Bug #42 has been assigned to you"             │   │
│  │      2026-05-09  10:32 AM          [Badge: UNREAD]  │   │
│  │      [Button: Mark as Read]                         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [Card — notification item]                         │   │
│  │  ✅  "Bug #38 has been solved"                      │   │
│  │      2026-05-08  04:15 PM          [Badge: READ]    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Shadcn components:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Card`, `Badge`, `Button`, `ScrollArea`

---

## 5. Step-by-Step Implementation Roadmap

---

### Phase 1 — Auth Integration & Routing

**Goal:** Working login/register flow with role-based redirect. Nothing else is accessible without auth.

- [ ] Install and configure `react-router-dom` with `BrowserRouter` in `main.jsx`
- [ ] Build `ProtectedRoute` component (reads `useAuthStore`, redirects based on role)
- [ ] Define all routes in `App.jsx` using `Routes` + `Route`, wired to placeholder `Page` components
- [ ] Build `LoginPage` — form, zod schema, `post('/users/accounts/login')`, `setUser()`, redirect
- [ ] Build `RegisterPage` — form, conditional job field, `post('/users/accounts/register')`, redirect
- [ ] Handle token-less auth: verify `useAuthStore` persists across refresh via cookie
- [ ] Add a root `/` route that redirects based on `user.role`

**Deliverable:** Full auth loop — register → login → land on role dashboard → persist session on refresh → logout clears cookie.

---

### Phase 2 — Global Layouts & Navigation

**Goal:** All three layout shells functional with working sidebar nav and top navbar.

- [ ] Build `Sidebar` component (shared logic, receives nav items as props)
- [ ] Build `TopNavbar` component with `Breadcrumb` (using `useLocation`) and notification bell
- [ ] Build `NotificationBell` — fetches `GET /notifications/my-notifications`, shows unread count badge
- [ ] Build `UserAvatarMenu` — `DropdownMenu` with profile link and logout action
- [ ] Wire `AdminLayout`, `StaffLayout`, `CustomerLayout` with sidebar + navbar
- [ ] Implement active nav item highlight (using `NavLink`)
- [ ] Add `framer-motion` `AnimatePresence` page transition wrapper in layout outlet

**Deliverable:** All three layouts render with correct nav, breadcrumbs update on navigation, notification bell shows live count.

---

### Phase 3 — Core Feature Pages

Build pages in this order (each depends on the previous auth + layout foundation):

#### Phase 3a — Dashboards
- [ ] `AdminDashboard` — stats cards (derive counts from `GET /bugs`, `GET /projects`), recent bugs table, recent notifications list
- [ ] `StaffDashboard` — stats from assigned bugs, work queue table
- [ ] `CustomerDashboard` — personal bug stats, recent bugs

#### Phase 3b — Projects (Admin)
- [ ] `ProjectsListPage` — `GET /projects`, card grid, search filter
- [ ] `CreateProjectPage` — form, `POST /projects/insert`, auto-fill `adminId` from store, success toast + redirect
- [ ] `ProjectDetailPage` — project info + bugs scoped to that project

#### Phase 3c — Bugs
- [ ] `AllBugsPage` (Admin) — `GET /bugs`, data table, status/priority/project filters, pagination
- [ ] `MyAssignedBugsPage` (Staff) — filtered from `GET /bugs` by `assignedStaffId`
- [ ] `MyBugsPage` (Customer) — filtered from `GET /bugs` by `customerId`
- [ ] `CreateBugPage` (Customer) — form, project select from `GET /projects`, `POST /bugs/insert`
- [ ] `BugDetailPage` — shared component, role-conditional action panels

#### Phase 3d — Bug Actions
- [ ] Admin assign flow — `Select` staff from `GET /users`, `PUT /bugs/assign`, invalidate bug query
- [ ] Admin message customer — `Textarea` + `POST /bugs/admin-message`
- [ ] Staff solve flow — confirm `Dialog`, `PUT /bugs/solve`, success notification
- [ ] Staff comment — `Textarea` + `POST /bugs/comment`

#### Phase 3e — Users (Admin)
- [ ] `UsersListPage` — `GET /users`, table, role badge, delete with `AlertDialog` confirm
- [ ] Delete: `DELETE /users/:id`, refetch list

#### Phase 3f — Notifications
- [ ] `NotificationsPage` — `GET /notifications/my-notifications`, tabs (All / Unread), `PUT /notifications/read/:id`

**Deliverable:** All core CRUD flows functional end-to-end for all three roles.

---

### Phase 4 — Polish, UX & Error Handling

**Goal:** Production-quality feel — loading states, error boundaries, empty states, animations.

- [ ] Add `Skeleton` loading components for every data table and card
- [ ] Add empty state illustrations/messages for zero-data scenarios ("No bugs found", "No projects yet")
- [ ] Implement global error boundary (catches React render errors)
- [ ] Add `Toaster` (Shadcn `Sonner`) for all success/error feedback — replace inline alerts
- [ ] Add `framer-motion` entrance animations on cards and table rows
- [ ] Add page-level `AnimatePresence` transitions (fade + slide)
- [ ] Implement optimistic updates on notification mark-as-read
- [ ] Add React Query `refetchOnWindowFocus` for notifications (keeps bell count live)
- [ ] Mobile responsive pass — collapsible sidebar (`Sheet`) on small viewports
- [ ] Accessibility audit — ensure all interactive elements have labels, focus rings, ARIA roles

**Deliverable:** Polished, production-grade UI with consistent feedback, animations, and responsive behavior.

---

### Phase 5 — Final QA & Cleanup

- [ ] Test all role permission boundaries (attempt to access admin routes as customer, expect redirect)
- [ ] Test session persistence across browser refresh and tab close
- [ ] Test all API error cases — 403, 404, 500 — confirm correct `Alert` or `toast` is shown
- [ ] Verify no `console.error` or unhandled promise rejections in any flow
- [ ] Remove all placeholder `<h1>` stubs and TODO comments
- [ ] Audit bundle with `vite build` — check for large chunks, add `React.lazy` + `Suspense` for route-level code splitting if needed

---

## Appendix — Shadcn Components Required

Run these commands as each component is first needed:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add sheet
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add breadcrumb
npx shadcn@latest add scroll-area
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add sonner
npx shadcn@latest add pagination
```

---

## Appendix — Data Flow Summary

```
User action (form submit / button click)
    │
    ▼
react-hook-form validates via zod schema
    │  (invalid → inline FormMessage, stop)
    ▼
api.js called (get / post / put / del)
    │  injects userId + role headers from useAuthStore.getState()
    ▼
fetch → http://localhost:8080/<endpoint>
    │
    ├─ success → React Query cache updated / invalidated
    │            → UI re-renders from fresh cache
    │            → toast success message
    │
    └─ error  → error.status / error.data inspected
                → toast error message or inline Alert
```
