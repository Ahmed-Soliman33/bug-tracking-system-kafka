import { useState } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { Menu, Bug, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const ROLE_COLORS = {
  ADMIN: "bg-primary text-primary-foreground",
  STAFF: "bg-emerald-600 text-white",
  CUSTOMER: "bg-amber-500 text-white",
}

function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export default function MobileSidebar({ navItems }) {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    clearUser()
    navigate("/login", { replace: true })
  }

  // Close sheet when route changes
  const handleNav = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 w-64">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border shrink-0">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--brand-navy)" }}
          >
            <Bug className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            Bug Tracker
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNav}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <Separator className="mx-3 w-auto" />

        {/* User card */}
        <div className="p-3 shrink-0">
          <div className="flex items-center gap-3 rounded-md px-3 py-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">{getInitials(user?.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName}</p>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0 mt-0.5 border-0", ROLE_COLORS[user?.role])}
              >
                {user?.role}
              </Badge>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
