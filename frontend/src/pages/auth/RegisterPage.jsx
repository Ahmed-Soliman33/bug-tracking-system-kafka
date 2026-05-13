import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Bug, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z.string().min(7, "Enter a valid phone number"),
    age: z.coerce
      .number({ invalid_type_error: "Age must be a number" })
      .min(21, "Age must be at least 21")
      .max(60, "Age must be at most 60"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "STAFF", "CUSTOMER"], { message: "Select a role" }),
    job: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (d) => {
      if (d.role === "STAFF") return !!d.job;
      return true;
    },
    { message: "Job type is required for Staff", path: ["job"] },
  );

const ROLE_REDIRECT = {
  ADMIN: "/admin",
  STAFF: "/staff",
  CUSTOMER: "/customer",
};
const ROLES = [
  { value: "ADMIN", label: "Administrator" },
  { value: "STAFF", label: "Staff" },
  { value: "CUSTOMER", label: "Customer" },
];
const JOBS = [
  { value: "FRONTEND", label: "Frontend" },
  { value: "BACKEND", label: "Backend" },
  { value: "FULLSTACK", label: "Full Stack" },
  { value: "QA", label: "QA Engineer" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "MOBILE", label: "Mobile" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const selectedRole = watch("role");

  async function onSubmit(values) {
    setServerError("");
    const { confirmPassword, ...payload } = values;
    if (payload.role !== "STAFF") delete payload.job;

    try {
      const res = await post("/users/accounts/register", payload);
      setUser(res.data);
      navigate(ROLE_REDIRECT[res.data.role] ?? "/login", { replace: true });
    } catch (err) {
      setServerError(
        err.data?.message || "Registration failed. Please try again.",
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "var(--brand-navy)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "var(--brand-teal)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{ background: "var(--brand-navy)" }}
          >
            <Bug className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bug Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise issue management
          </p>
        </div>

        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Server error */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-500"
                >
                  {serverError}
                </motion.div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  placeholder="Ahmed Mohamed"
                  autoComplete="name"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone + Age row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="01012345678"
                    autoComplete="tel"
                    {...register("phoneNumber")}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="30"
                    {...register("age")}
                    className={errors.age ? "border-red-500" : ""}
                  />
                  {errors.age && (
                    <p className="text-xs text-red-500">{errors.age.message}</p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.role ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* Job type — only for STAFF */}
              <AnimatePresence>
                {selectedRole === "STAFF" && (
                  <motion.div
                    key="job"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <Label>Job type</Label>
                    <Controller
                      name="job"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className={errors.job ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Select your specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOBS.map((j) => (
                              <SelectItem key={j.value} value={j.value}>
                                {j.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.job && (
                      <p className="text-xs text-red-500">
                        {errors.job.message}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    {...register("password")}
                    className={
                      errors.password ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={
                      errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold text-white"
                disabled={isSubmitting}
                style={{ background: "var(--brand-navy)" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium underline-offset-4 hover:underline transition-colors"
                style={{ color: "var(--brand-navy)" }}
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Bug Tracker. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
