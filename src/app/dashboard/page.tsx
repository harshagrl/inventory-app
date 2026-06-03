// ──────────────────────────────────────────────────────────────
// Dashboard Page — Accessible by both ADMIN and SELLER
// ──────────────────────────────────────────────────────────────
//
// This is a Server Component (no "use client"). It uses
// getServerSession() to read the session on the server side.
//
// In Express terms, this is like:
//   app.get("/dashboard", requireAuth, (req, res) => {
//     const user = req.user;
//     res.render("dashboard", { user });
//   });
//
// Except here, the auth check happens in middleware.ts BEFORE
// this code ever runs. If you reach this page, you're
// guaranteed to be authenticated.
// ──────────────────────────────────────────────────────────────

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Always fetch fresh data

export default async function DashboardPage() {
  // getServerSession() reads the JWT from cookies on the server.
  // It's the server-side equivalent of useSession() (which is client-side).
  const session = await getServerSession(authOptions);

  if (!session) {
    // This shouldn't happen because middleware.ts already
    // blocks unauthenticated users — but belt-and-suspenders.
    redirect("/login");
  }

  // Fetch live data from Neon
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: true,
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });

  // Serialize BigInt/Decimal for client component
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    category: p.category,
    baseUnit: p.baseUnit,
    basePricePaise: p.basePricePaise.toString(),
    stockQuantityBase: p.stockQuantityBase.toString(),
  }));

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalPaise: o.totalPaise.toString(),
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    user: { name: o.user.name, email: o.user.email },
    items: o.items.map((item) => ({
      id: item.id,
      quantityBase: item.quantityBase.toString(),
      unitOrdered: item.unitOrdered,
      unitPricePaiseAtOrder: item.unitPricePaiseAtOrder.toString(),
      product: { name: item.product.name },
    })),
  }));

  return (
    <DashboardView
      initialProducts={serializedProducts}
      initialOrders={serializedOrders}
    />
  );
}
