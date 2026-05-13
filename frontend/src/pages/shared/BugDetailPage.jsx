import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get, put, post } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { statusBadgeClass, priorityBadgeClass, formatDateTime } from "@/lib/bugUtils"
import { ArrowLeft, Loader2, UserCheck, CheckCircle2, MessageSquare, Send, Bug, FolderKanban } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

function DetailRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  )
}

export default function BugDetailPage({ rolePrefix }) {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [staffId, setStaffId] = useState("")
  const [comment, setComment] = useState("")
  const [adminMsg, setAdminMsg] = useState("")
  const [actionError, setActionError] = useState("")

  const { data: bug, isLoading, error } = useQuery({
    queryKey: ["bug", id],
    queryFn: () => get(`/bugs/${id}`),
    select: (res) => res?.data ?? res,
    retry: false,
  })

  const { data: staffUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => get("/users"),
    select: (res) => {
      const all = Array.isArray(res) ? res : res?.data ?? []
      return all.filter((u) => u.role === "STAFF")
    },
    enabled: user?.role === "ADMIN",
  })

  const assignMut = useMutation({
    mutationFn: ({ bugId, staffId }) => put("/bugs/assign", { bugId, staffId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bug", id] })
      qc.invalidateQueries({ queryKey: ["bugs"] })
      setStaffId("")
      setActionError("")
      toast.success("Bug assigned successfully.")
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to assign bug."
      setActionError(msg)
      toast.error(msg)
    },
  })

  const solveMut = useMutation({
    mutationFn: ({ bugId, customerId }) => put("/bugs/solve", { bugId, customerId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bug", id] })
      qc.invalidateQueries({ queryKey: ["bugs"] })
      setActionError("")
      toast.success("Bug marked as solved.")
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to mark as solved."
      setActionError(msg)
      toast.error(msg)
    },
  })

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ["project-by-name", bug?.projectName],
    queryFn: () => get(`/projects/name/${encodeURIComponent(bug.projectName)}`),
    enabled: !!bug?.projectName && user?.role === "STAFF",
    select: (res) => res?.data ?? res,
  })

  const commentMut = useMutation({
    mutationFn: ({ bugId, adminId, comment }) => post("/bugs/comment", { bugId, adminId, comment }),
    onSuccess: () => {
      setComment("")
      setActionError("")
      toast.success("Comment sent to admin.")
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to send comment."
      setActionError(msg)
      toast.error(msg)
    },
  })

  const adminMsgMut = useMutation({
    mutationFn: ({ bugId, customerId, message }) => post("/bugs/admin-message", { bugId, customerId, message }),
    onSuccess: () => {
      setAdminMsg("")
      setActionError("")
      toast.success("Message sent to customer.")
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to send message."
      setActionError(msg)
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-5 w-16" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !bug) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Bug not found or access denied.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin    = user?.role === "ADMIN"
  const isStaff    = user?.role === "STAFF"
  const isMyBug    = isStaff && bug.assignedStaffId === user?.id
  const canAssign  = isAdmin && bug.status === "OPEN"
  const canSolve   = isMyBug && (bug.status === "ASSIGNED" || bug.status === "IN_PROGRESS")
  const canComment = isStaff && isMyBug
  const canMsg     = isAdmin

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{bug.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Bug #{bug.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs px-3 py-1 rounded-full border font-medium ${priorityBadgeClass(bug.priority)}`}>
            {bug.priority}
          </Badge>
          <Badge className={`text-xs px-3 py-1 rounded-full border font-medium ${statusBadgeClass(bug.status)}`}>
            {bug.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {bug.description || <span className="text-muted-foreground italic">No description provided.</span>}
              </p>
            </CardContent>
          </Card>

          {/* Action error */}
          {actionError && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-500">
              {actionError}
            </div>
          )}

          {/* Admin: Assign bug */}
          {canAssign && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Assign to Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={staffId} onValueChange={setStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffUsers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.fullName} {s.job ? `(${s.job})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!staffId || assignMut.isPending}
                  onClick={() => assignMut.mutate({ bugId: bug.id, staffId: Number(staffId) })}
                  className="text-white"
                  style={{ background: "var(--brand-navy)" }}
                >
                  {assignMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Assigning…</> : "Assign Bug"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Staff: Solve bug */}
          {canSolve && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Mark as Solved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  This will notify the customer that their bug has been resolved.
                </p>
                <Button
                  disabled={solveMut.isPending}
                  onClick={() => solveMut.mutate({ bugId: bug.id, customerId: bug.customerId })}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {solveMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Solving…</> : "Mark as Solved"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Staff: Comment to admin */}
          {canComment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Comment to Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment for the admin..."
                  rows={3}
                />
                <Button
                  disabled={!comment.trim() || commentMut.isPending || projectLoading}
                  onClick={() => commentMut.mutate({ bugId: bug.id, adminId: projectData.adminId, comment })}
                  variant="outline"
                >
                  {(commentMut.isPending || projectLoading)
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{projectLoading ? "Loading…" : "Sending…"}</>
                    : <><Send className="h-4 w-4 mr-2" />Send Comment</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Admin: Message customer */}
          {canMsg && bug.customerId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Send className="h-4 w-4" /> Message Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={adminMsg}
                  onChange={(e) => setAdminMsg(e.target.value)}
                  placeholder="Write a message to the customer..."
                  rows={3}
                />
                <Button
                  disabled={!adminMsg.trim() || adminMsgMut.isPending}
                  onClick={() => adminMsgMut.mutate({ bugId: bug.id, customerId: bug.customerId, message: adminMsg })}
                  variant="outline"
                >
                  {adminMsgMut.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending…</> : <><Send className="h-4 w-4 mr-2" />Send Message</>}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar details */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Status">
                <Badge className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadgeClass(bug.status)}`}>
                  {bug.status}
                </Badge>
              </DetailRow>
              <DetailRow label="Priority">
                <Badge className={`text-[11px] px-2 py-0.5 rounded-full border ${priorityBadgeClass(bug.priority)}`}>
                  {bug.priority}
                </Badge>
              </DetailRow>
              <DetailRow label="Project">
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  {bug.projectName}
                </span>
              </DetailRow>
              <DetailRow label="Reporter">
                <span className="text-sm">Customer #{bug.customerId}</span>
              </DetailRow>
              <DetailRow label="Assignee">
                <span className="text-sm">
                  {bug.assignedStaffId ? `Staff #${bug.assignedStaffId}` : <span className="text-muted-foreground">Unassigned</span>}
                </span>
              </DetailRow>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
