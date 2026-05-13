import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { post } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FolderKanban } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const schema = z.object({
  projectName:  z.string().min(2, "Name must be at least 2 characters"),
  description:  z.string().min(5, "Description must be at least 5 characters"),
})

export default function CreateProjectPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [serverError, setServerError] = useState("")

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: (data) => post("/projects/insert", { ...data, adminId: user.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project created successfully.")
      navigate("/admin/projects", { replace: true })
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to create project. Please try again."
      setServerError(msg)
      toast.error(msg)
    },
  })

  function onSubmit(values) {
    setServerError("")
    createMut.mutate(values)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Project</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Create a new project to track bugs</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="h-4.5 w-4.5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-500">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                placeholder="E-Commerce App"
                {...register("projectName")}
                className={errors.projectName ? "border-red-500" : ""}
              />
              {errors.projectName && <p className="text-xs text-red-500">{errors.projectName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this project..."
                rows={4}
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || createMut.isPending}
                className="text-white"
                style={{ background: "var(--brand-navy)" }}
              >
                {(isSubmitting || createMut.isPending) ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating…</>
                ) : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/projects")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
