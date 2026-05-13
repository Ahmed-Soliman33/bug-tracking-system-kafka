import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get, put } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Check } from "lucide-react"
import { formatDateTime } from "@/lib/bugUtils"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { motion } from "framer-motion"

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.2 } }),
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function NotificationItem({ notification, onRead, rolePrefix, index }) {
  const navigate = useNavigate()
  const isUnread = notification.status === "UNREAD"

  function handleClick() {
    if (isUnread) onRead(notification.id)
    if (notification.bugId) {
      navigate(`/${rolePrefix}/bugs/${notification.bugId}`)
    }
  }

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
        isUnread ? "bg-primary/5 border-primary/20 hover:bg-primary/10" : "hover:bg-muted/50"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUnread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        <Bell className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isUnread ? "font-medium" : "text-muted-foreground"}`}>
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</span>
          {notification.bugId && (
            <span className="text-xs text-muted-foreground">Bug #{notification.bugId}</span>
          )}
        </div>
      </div>
      {isUnread && (
        <div className="h-2 w-2 shrink-0 rounded-full mt-2" style={{ background: "var(--brand-teal)" }} />
      )}
    </motion.div>
  )
}

export default function NotificationsPage({ rolePrefix }) {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => get("/notifications/my-notifications"),
    refetchOnWindowFocus: true,
    select: (res) => {
      const list = Array.isArray(res) ? res : res?.data ?? []
      return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    },
  })

  const readMut = useMutation({
    mutationFn: (id) => put(`/notifications/read/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["notifications"] })
      const prev = qc.getQueryData(["notifications"])
      qc.setQueryData(["notifications"], (old) => {
        if (!old) return old
        const list = Array.isArray(old) ? old : old?.data ?? []
        return list.map((n) => n.id === id ? { ...n, status: "READ" } : n)
      })
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(["notifications"], ctx.prev)
      toast.error("Failed to mark notification as read.")
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  function markAllRead() {
    const unread = notifications.filter((n) => n.status === "UNREAD")
    unread.forEach((n) => readMut.mutate(n.id))
    if (unread.length > 0) toast.success(`Marked ${unread.length} notifications as read.`)
  }

  const unread = notifications.filter((n) => n.status === "UNREAD")
  const read   = notifications.filter((n) => n.status === "READ")

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : unread.length > 0 ? `${unread.length} unread` : "All caught up"}
          </p>
        </div>
        {!isLoading && unread.length > 0 && (
          <button
            onClick={markAllRead}
            disabled={readMut.isPending}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">
            Unread
            {!isLoading && unread.length > 0 && (
              <Badge
                className="ml-2 h-4.5 min-w-4.5 px-1 text-[10px] rounded-full"
                style={{ background: "var(--brand-teal)", color: "#fff", border: "none" }}
              >
                {unread.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-2 mt-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <NotificationSkeleton key={i} />)
          ) : unread.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No unread notifications.</p>
              </CardContent>
            </Card>
          ) : (
            unread.map((n, i) => (
              <NotificationItem key={n.id} notification={n} onRead={(id) => readMut.mutate(id)} rolePrefix={rolePrefix} index={i} />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-2 mt-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <NotificationSkeleton key={i} />)
          ) : read.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No read notifications.</p>
              </CardContent>
            </Card>
          ) : (
            read.map((n, i) => (
              <NotificationItem key={n.id} notification={n} onRead={(id) => readMut.mutate(id)} rolePrefix={rolePrefix} index={i} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <NotificationSkeleton key={i} />)
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n, i) => (
              <NotificationItem key={n.id} notification={n} onRead={(id) => readMut.mutate(id)} rolePrefix={rolePrefix} index={i} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
