import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get, del } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/stat-card-skeleton"
import { Users, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "sonner"
import { motion } from "framer-motion"

function roleBadge(role) {
  switch (role) {
    case "ADMIN":    return "bg-primary/10 text-primary border-primary/20"
    case "STAFF":    return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case "CUSTOMER": return "bg-amber-100 text-amber-800 border-amber-200"
    default:         return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03, duration: 0.2 } }),
}

export default function UsersListPage() {
  const currentUser = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => get("/users"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => del(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
      toast.success("User deleted successfully.")
    },
    onError: () => toast.error("Failed to delete user."),
  })

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "ALL" || u.role === roleFilter
    return matchSearch && matchRole
  })

  function handleDelete(user) {
    if (user.id === currentUser?.id) return
    if (!window.confirm(`Delete user "${user.fullName}"? This cannot be undone.`)) return
    deleteMut.mutate(user.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isLoading ? "Loading…" : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "ADMIN", "STAFF", "CUSTOMER"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {r === "ALL" ? "All" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No users match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials(u.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.fullName}</span>
                      {u.id === currentUser?.id && (
                        <Badge className="text-[10px] px-1.5 py-0 rounded-full border bg-primary/10 text-primary border-primary/20">you</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{u.email}</span></TableCell>
                  <TableCell>
                    <Badge className={`text-[11px] px-2 py-0.5 rounded-full border ${roleBadge(u.role)}`}>
                      {u.role}
                    </Badge>
                    {u.job && <span className="text-[11px] text-muted-foreground ml-1.5">{u.job}</span>}
                  </TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{u.phoneNumber || "—"}</span></TableCell>
                  <TableCell><span className="text-sm text-muted-foreground">{u.age || "—"}</span></TableCell>
                  <TableCell>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleteMut.isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
