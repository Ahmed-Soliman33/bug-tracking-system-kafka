import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { LayoutDashboard, Bug, Bell } from "lucide-react"
import Sidebar from "@/components/navigation/Sidebar"
import TopNavbar from "@/components/navigation/TopNavbar"

const NAV_ITEMS = [
  { to: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/bugs", label: "My Assigned Bugs", icon: Bug },
  { to: "/staff/notifications", label: "Notifications", icon: Bell },
]

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
}

export default function StaffLayout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={NAV_ITEMS} />
      <div className="flex flex-1 flex-col lg:pl-60">
        <TopNavbar notificationsPath="/staff/notifications" navItems={NAV_ITEMS} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 sm:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
