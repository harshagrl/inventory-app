// ──────────────────────────────────────────────────────────────
// Admin Page — Only ADMIN role can access
// ──────────────────────────────────────────────────────────────
//
// If a SELLER tries to visit /admin, the middleware.ts
// redirects them to /dashboard before this code runs.
// ──────────────────────────────────────────────────────────────

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shield, Users, Package, ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch admin-level stats
  const [userCount, productCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-pink-600 rounded-xl shadow-lg shadow-rose-500/20">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Admin Console
          </h1>
          <p className="text-xs text-[#a1a1aa]">
            Signed in as {session.user.email} • Role:{" "}
            <span className="text-rose-400 font-semibold">
              {session.user.role}
            </span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Registered Users
            </span>
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{userCount}</h3>
        </div>

        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Products
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{productCount}</h3>
        </div>

        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white">{orderCount}</h3>
        </div>
      </div>

      <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-6">
        <p className="text-sm text-[#a1a1aa]">
          🔒 This page is only visible to users with the{" "}
          <code className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono text-xs">
            ADMIN
          </code>{" "}
          role. Sellers who try to access <code className="text-[#71717a] font-mono text-xs">/admin</code>{" "}
          are automatically redirected to <code className="text-[#71717a] font-mono text-xs">/dashboard</code>{" "}
          by the middleware.
        </p>
      </div>
    </div>
  );
}
