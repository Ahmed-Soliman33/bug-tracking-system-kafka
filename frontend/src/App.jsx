import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, FolderKanban, Bug } from 'lucide-react'
import { statusBadgeClass, priorityBadgeClass } from '@/lib/bugUtils'

import ProtectedRoute from '@/routes/ProtectedRoute'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import AdminLayout from '@/components/layout/AdminLayout'
import StaffLayout from '@/components/layout/StaffLayout'
import CustomerLayout from '@/components/layout/CustomerLayout'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ProjectsListPage from '@/pages/admin/ProjectsListPage'
import CreateProjectPage from '@/pages/admin/CreateProjectPage'
import AllBugsPage from '@/pages/admin/AllBugsPage'
import UsersListPage from '@/pages/admin/UsersListPage'

// Staff pages
import StaffDashboard from '@/pages/staff/StaffDashboard'
import MyAssignedBugsPage from '@/pages/staff/MyAssignedBugsPage'

// Customer pages
import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import MyBugsPage from '@/pages/customer/MyBugsPage'
import CreateBugPage from '@/pages/customer/CreateBugPage'

// Shared pages
import BugDetailPage from '@/pages/shared/BugDetailPage'
import NotificationsPage from '@/pages/shared/NotificationsPage'

const ROLE_DEFAULT = { ADMIN: '/admin/dashboard', STAFF: '/staff/dashboard', CUSTOMER: '/customer/dashboard' }

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  if (user) return <Navigate to={ROLE_DEFAULT[user.role] ?? '/login'} replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Public auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin — nested layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="bugs" element={<AllBugsPage />} />
        <Route path="bugs/:id" element={<BugDetailPage rolePrefix="admin" />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="notifications" element={<NotificationsPage rolePrefix="admin" />} />
      </Route>

      {/* Staff — nested layout */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['STAFF']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="bugs" element={<MyAssignedBugsPage />} />
        <Route path="bugs/:id" element={<BugDetailPage rolePrefix="staff" />} />
        <Route path="notifications" element={<NotificationsPage rolePrefix="staff" />} />
      </Route>

      {/* Customer — nested layout */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="bugs" element={<MyBugsPage />} />
        <Route path="bugs/new" element={<CreateBugPage />} />
        <Route path="bugs/:id" element={<BugDetailPage rolePrefix="customer" />} />
        <Route path="notifications" element={<NotificationsPage rolePrefix="customer" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ProjectDetailPage() {
  const { id } = useParams()

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => get(`/projects/${id}`),
    select: (res) => res?.data ?? res,
  })

  const { data: allBugs = [], isLoading: bugsLoading } = useQuery({
    queryKey: ['bugs'],
    queryFn: () => get('/bugs'),
    select: (res) => {
      const list = Array.isArray(res) ? res : res?.data ?? []
      return list.filter((b) => b.projectName === project?.projectName)
    },
    enabled: !!project?.projectName,
  })

  const isLoading = projectLoading || bugsLoading

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {projectLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--brand-navy)' }}>
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{project?.projectName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{project?.description || 'No description.'}</p>
            </div>
          </div>
          <Badge variant="outline" className="mt-3 text-xs">Admin ID: {project?.adminId}</Badge>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bugs in this project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : allBugs.length === 0 ? (
            <div className="py-10 text-center">
              <Bug className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No bugs reported for this project yet.</p>
            </div>
          ) : (
            allBugs.map((bug) => (
              <Link
                key={bug.id}
                to={`/admin/bugs/${bug.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary">{bug.title}</p>
                  {bug.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{bug.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Badge className={`text-[11px] px-2 py-0.5 rounded-full border ${priorityBadgeClass(bug.priority)}`}>
                    {bug.priority}
                  </Badge>
                  <Badge className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadgeClass(bug.status)}`}>
                    {bug.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
