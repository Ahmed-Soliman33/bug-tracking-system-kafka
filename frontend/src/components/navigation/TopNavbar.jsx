import { useLocation, useNavigate, Link } from "react-router-dom"
import { Bell, LogOut } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { get } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import MobileSidebar from "@/components/navigation/MobileSidebar"

const SEGMENT_LABELS = {
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
  dashboard: "Dashboard",
  projects: "Projects",
  bugs: "Bugs",
  users: "Users",
  notifications: "Notifications",
  new: "New",
}

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)

  return segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/")
    const label = SEGMENT_LABELS[seg] ?? (seg.match(/^\d+$/) ? `#${seg}` : seg)
    const isLast = idx === segments.length - 1
    return { path, label, isLast }
  })
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function NotificationBell({ notificationsPath }) {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => get("/notifications/my-notifications"),
    refetchInterval: 30_000,
    select: (res) => {
      const list = Array.isArray(res) ? res : res?.data ?? []
      return list.filter((n) => n.status === "UNREAD").length
    },
  })

  const unread = data ?? 0

  return (
    <Link
      to={notificationsPath}
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-4.5 w-4.5" />
      {unread > 0 && (
        <Badge
          className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
          style={{ background: "var(--brand-teal)", color: "#fff", border: "none" }}
        >
          {unread > 99 ? "99+" : unread}
        </Badge>
      )}
    </Link>
  )
}

export default function TopNavbar({ notificationsPath, navItems = [] }) {
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate = useNavigate()
  const crumbs = useBreadcrumbs()

  function handleLogout() {
    clearUser()
    navigate("/login", { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6 gap-3">
      {/* Mobile hamburger */}
      <MobileSidebar navItems={navItems} />

      {/* Breadcrumb */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, i) => (
            <BreadcrumbItem key={crumb.path}>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.path}>{crumb.label}</BreadcrumbLink>
              )}
              {!crumb.isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <NotificationBell notificationsPath={notificationsPath} />

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{getInitials(user?.fullName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">{user?.fullName?.split(" ")[0]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
