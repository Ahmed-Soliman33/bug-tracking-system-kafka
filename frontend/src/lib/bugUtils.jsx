export function priorityBadgeClass(priority) {
  switch (priority) {
    case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
    case "HIGH":     return "bg-orange-100 text-orange-800 border-orange-200"
    case "MEDIUM":   return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "LOW":      return "bg-green-100 text-green-800 border-green-200"
    default:         return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function statusBadgeClass(status) {
  switch (status) {
    case "OPEN":        return "bg-blue-100 text-blue-800 border-blue-200"
    case "ASSIGNED":    return "bg-purple-100 text-purple-800 border-purple-200"
    case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "FIXED":       return "bg-teal-100 text-teal-800 border-teal-200"
    case "SOLVED":      return "bg-green-100 text-green-800 border-green-200"
    case "CLOSED":      return "bg-gray-100 text-gray-700 border-gray-200"
    default:            return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function formatDateTime(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
