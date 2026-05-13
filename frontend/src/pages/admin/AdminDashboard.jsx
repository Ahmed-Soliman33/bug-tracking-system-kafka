import { useQuery } from "@tanstack/react-query"
import { get } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, FolderKanban, Users, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { statusBadgeClass, priorityBadgeClass } from "@/lib/bugUtils"
import { Link } from "react-router-dom"
import { StatCardSkeleton } from "@/components/ui/stat-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.25, ease: "easeOut" } }),
}

function StatCard({ icon: Icon, label, value, sub, accent, index }) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: accent + "18" }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data: bugs = [], isLoading: bugsLoading } = useQuery({
    queryKey: ["bugs"],
    queryFn: () => get("/bugs"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => get("/projects"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => get("/users"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const isLoading = bugsLoading || projectsLoading || usersLoading

  const openBugs     = bugs.filter((b) => b.status === "OPEN").length
  const assignedBugs = bugs.filter((b) => b.status === "ASSIGNED").length
  const solvedBugs   = bugs.filter((b) => b.status === "SOLVED").length
  const recentBugs   = [...bugs].slice(-5).reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your bug tracker</p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard index={0} icon={Bug}          label="Total Bugs"  value={bugs.length}     sub={`${openBugs} open`}           accent="#000093" />
            <StatCard index={1} icon={AlertCircle}  label="Open"        value={openBugs}        sub="Awaiting assignment"           accent="#ef4444" />
            <StatCard index={2} icon={Clock}        label="Assigned"    value={assignedBugs}    sub="In progress"                  accent="#a855f7" />
            <StatCard index={3} icon={CheckCircle2} label="Solved"      value={solvedBugs}      sub="All time"                     accent="#01ab77" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard index={4} icon={FolderKanban} label="Projects"    value={projects.length} sub="Active projects"              accent="#3b82f6" />
            <StatCard index={5} icon={Users}        label="Users"       value={users.length}    sub={`${users.filter(u => u.role === "STAFF").length} staff members`} accent="#f59e0b" />
          </div>
        </>
      )}

      {/* Recent bugs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.25 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Bugs</CardTitle>
            <Link
              to="/admin/bugs"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--brand-navy)" }}
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))
            ) : recentBugs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No bugs reported yet.</p>
            ) : (
              recentBugs.map((bug) => (
                <Link
                  key={bug.id}
                  to={`/admin/bugs/${bug.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary">{bug.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bug.projectName}</p>
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
      </motion.div>
    </div>
  )
}
