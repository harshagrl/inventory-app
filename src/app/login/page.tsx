// ──────────────────────────────────────────────────────────────
// Login Page
// ──────────────────────────────────────────────────────────────
//
// WHY "use client"?
// This page has interactive state: form inputs, loading spinner,
// error messages, and the signIn() call. All of those require
// browser-side JavaScript. In App Router, components are Server
// Components by default (no JS shipped to browser), so we opt
// into Client Component mode with "use client".
//
// In Express/Node.js terms: this is like a frontend page that
// makes a POST request to your /api/auth/callback/credentials
// endpoint — except NextAuth's signIn() function handles all
// that for you.
// ──────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layers, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // signIn("credentials", ...) calls the authorize() function
      // we defined in auth.ts. `redirect: false` tells it NOT to
      // do a full-page redirect on error — instead it returns an
      // object with { ok, error } so we can show inline errors.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Login succeeded — push to dashboard.
        // router.push() is the App Router equivalent of
        // Express's res.redirect() — it does client-side navigation.
        router.push("/dashboard");
        router.refresh(); // Force re-fetch server components so the session updates
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AASA MEDCHEM
          </h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Inventory & Order Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Sign in to your account</h2>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#71717a]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@test.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#71717a]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-[#71717a] hover:text-[#a1a1aa] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-rose-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-4 bg-[#18181b]/50 border border-[#27272a] rounded-xl">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#a1a1aa] mb-2.5">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a1a1aa]">Admin</span>
                <span className="font-mono text-violet-400">
                  admin@test.com / admin123
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#a1a1aa]">Seller</span>
                <span className="font-mono text-indigo-400">
                  seller@test.com / seller123
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#71717a] mt-6">
          Next.js 14 • Prisma • Neon PostgreSQL • NextAuth.js
        </p>
      </div>
    </div>
  );
}
