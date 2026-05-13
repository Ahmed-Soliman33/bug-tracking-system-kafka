import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { get, del } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"

function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
        <Skeleton className="h-5 w-40 mt-3" />
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto pt-2 border-t">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.25, ease: "easeOut" } }),
}

export default function ProjectsListPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [deletingId, setDeletingId] = useState(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => get("/projects"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => del(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] })
      setDeletingId(null)
      toast.success("Project deleted successfully.")
    },
    onError: () => {
      setDeletingId(null)
      toast.error("Failed to delete project.")
    },
  })

  function handleDelete(e, project) {
    e.preventDefault()
    if (!window.confirm(`Delete project "${project.projectName}"? This cannot be undone.`)) return
    setDeletingId(project.projectId)
    deleteMut.mutate(project.projectId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: "var(--brand-navy)" }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No projects yet. Create your first one.</p>
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "var(--brand-navy)" }}
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div key={project.projectId} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card className="group relative flex flex-col hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "var(--brand-navy)", opacity: 0.9 }}
                    >
                      <FolderKanban className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {user?.id === project.adminId && (
                        <button
                          onClick={(e) => handleDelete(e, project)}
                          disabled={deletingId === project.projectId}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete project"
                        >
                          {deletingId === project.projectId
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      )}
                      <Link
                        to={`/admin/projects/${project.projectId}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="View project"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-3 leading-tight">{project.projectName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                  <div className="mt-auto pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                      Admin ID: {project.adminId}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
