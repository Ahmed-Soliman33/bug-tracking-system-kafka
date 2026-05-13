import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { post, get } from "@/lib/api"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Bug } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const schema = z.object({
  title:       z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  priority:    z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], { message: "Select a priority" }),
  projectName: z.string().min(1, "Select a project"),
})

const PRIORITIES = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
]

export default function CreateBugPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [serverError, setServerError] = useState("")

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => get("/projects"),
    select: (res) => (Array.isArray(res) ? res : res?.data ?? []),
  })

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMut = useMutation({
    mutationFn: (data) => post("/bugs/insert", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bugs"] })
      toast.success("Bug reported successfully.")
      navigate("/customer/bugs", { replace: true })
    },
    onError: (err) => {
      const msg = err.data?.message || "Failed to report bug. Please try again."
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
        <h1 className="text-2xl font-semibold">Report a Bug</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Describe the issue you encountered</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-4.5 w-4.5" />
            Bug Details
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
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the bug"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="description"
                placeholder="Detailed steps to reproduce the issue..."
                rows={4}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Project</Label>
                <Controller
                  name="projectName"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errors.projectName ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.projectId} value={p.projectName}>
                            {p.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.projectName && <p className="text-xs text-red-500">{errors.projectName.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || createMut.isPending}
                className="text-white"
                style={{ background: "var(--brand-navy)" }}
              >
                {(isSubmitting || createMut.isPending) ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                ) : "Submit Bug Report"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customer/bugs")}
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
