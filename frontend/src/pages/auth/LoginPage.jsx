import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const ROLE_REDIRECT = {
  ADMIN: "/admin",
  STAFF: "/staff",
  CUSTOMER: "/customer",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setServerError("");
    try {
      const res = await post("/users/accounts/login", values);
      setUser(res.data);
      navigate(ROLE_REDIRECT[res.data.role] ?? "/login", { replace: true });
    } catch (err) {
      setServerError(err.data?.message || "Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "var(--brand-navy)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "var(--brand-teal)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
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
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
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

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                  className={
                    errors.email
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register("password")}
                    className={
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500 pr-10"
                        : "pr-10"
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

              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold text-white"
                disabled={isSubmitting}
                style={{ background: "var(--brand-navy)" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium underline-offset-4 hover:underline transition-colors"
                style={{ color: "var(--brand-navy)" }}
              >
                Create one
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
