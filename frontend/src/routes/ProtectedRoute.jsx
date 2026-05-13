import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = { ADMIN: "/admin", STAFF: "/staff", CUSTOMER: "/customer" }
    return <Navigate to={redirectMap[user.role] ?? "/login"} replace />
  }

  return children
}
