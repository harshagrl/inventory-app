// ──────────────────────────────────────────────────────────────
// Admin Products List — Server Component
// ──────────────────────────────────────────────────────────────
// This page fetches products directly from the database using
// Prisma (no API call needed — server components can do DB
// queries inline). It renders a table with edit/delete actions.
// ──────────────────────────────────────────────────────────────

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatQuantity, formatPriceINR } from "@/lib/units";
import Link from "next/link";
import DeleteProductButton from "@/components/DeleteProductButton";
import { Package, Plus, Shield, ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unitLabel: Record<string, string> = {
    GRAM: "Weight (g)",
    MILLILITER: "Volume (mL)",
    ITEM: "Count",
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Header */}
      <div className="border-b border-[#27272a] bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-400" />
                <h1 className="text-xl font-bold text-white">Product Management</h1>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                {products.length} product{products.length !== 1 ? "s" : ""} in inventory
              </p>
            </div>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#18181b]/30">
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Unit Type</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider text-right">Price (INR)</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider text-right">Stock</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {products.length > 0 ? (
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-[#18181b]/20 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-[#a1a1aa] mt-0.5 line-clamp-1 max-w-xs">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono bg-[#18181b] border border-[#27272a] px-2 py-1 rounded text-gray-300">
                          {p.sku}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-violet-400 font-semibold">{p.category}</td>
                      <td className="p-4">
                        <span className="text-xs bg-[#18181b] border border-[#27272a] px-2 py-1 rounded text-[#a1a1aa]">
                          {unitLabel[p.baseUnit] || p.baseUnit}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-white">
                        {formatPriceINR(p.basePricePaise)}
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-white">
                        {formatQuantity(Number(p.stockQuantityBase), p.baseUnit)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600/10 text-violet-400 border border-violet-500/20 hover:bg-violet-600 hover:text-white hover:border-transparent transition-all"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Package className="h-10 w-10 mx-auto text-[#71717a] mb-3" />
                      <p className="text-sm text-[#71717a]">No products found.</p>
                      <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-violet-400 hover:text-violet-300"
                      >
                        <Plus className="h-3 w-3" /> Add your first product
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
