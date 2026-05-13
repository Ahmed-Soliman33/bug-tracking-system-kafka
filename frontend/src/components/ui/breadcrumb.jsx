import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ ...props }) {
  return <nav aria-label="breadcrumb" {...props} />
}

export function BreadcrumbList({ className, ...props }) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)}
      {...props}
    />
  )
}

export function BreadcrumbItem({ className, ...props }) {
  return <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}

export function BreadcrumbLink({ className, asChild: _asChild, ...props }) {
  return (
    <a
      className={cn("transition-colors hover:text-foreground cursor-pointer", className)}
      {...props}
    />
  )
}

export function BreadcrumbPage({ className, ...props }) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <span role="presentation" aria-hidden="true" className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)} {...props}>
      {children ?? <ChevronRight />}
    </span>
  )
}

export function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  )
}
