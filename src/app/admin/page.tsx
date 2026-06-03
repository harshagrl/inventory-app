import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceINR, formatQuantity } from "@/lib/units";
import { Package, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Total products count
  const totalProducts = await prisma.product.count();

  // 2. Pending orders count
  const pendingOrders = await prisma.order.count({
    where: { status: "PENDING" },
  });

  // 3. Total revenue (sum of DELIVERED orders)
  const deliveredOrders = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    select: { totalPaise: true },
  });
  const totalRevenuePaise = deliveredOrders.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, order: any) => sum + Number(order.totalPaise),
    0
  );

  // 4. Low stock alerts (Threshold: less than 10000 base units, e.g., < 10kg/10L or < 10 items for simplicity. 
  // Let's use a dynamic threshold depending on base unit to be slightly more accurate, but for now we'll fetch items and filter in JS for simplicity or use a static low threshold in query.
  const products = await prisma.product.findMany();
  
  const lowStockProducts = products.filter(p => {
    // For ITEM, threshold could be 50. For GRAM/MILLILITER, threshold 5000 (5kg/L)
    const threshold = p.baseUnit === "ITEM" ? 50 : 5000;
    return Number(p.stockQuantityBase) < threshold;
  });

  return (
    <main className="p-6 md:p-10 overflow-y-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Admin Dashboard</h1>
        <p className="text-[#a1a1aa] text-sm">
          Overview of your store&apos;s performance and inventory health.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#0c0c0e] border border-[#27272a] p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase font-bold tracking-wider">Total Products</p>
            <p className="text-2xl font-extrabold text-white">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-[#27272a] p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase font-bold tracking-wider">Pending Orders</p>
            <p className="text-2xl font-extrabold text-white">{pendingOrders}</p>
          </div>
        </div>

        <div className="bg-[#0c0c0e] border border-[#27272a] p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-[#a1a1aa] uppercase font-bold tracking-wider">Total Revenue</p>
            <p className="text-xl font-extrabold text-emerald-400">{formatPriceINR(totalRevenuePaise)}</p>
          </div>
        </div>
        
        <div className="bg-[#0c0c0e] border border-rose-500/30 p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <AlertTriangle className="h-24 w-24 text-rose-500" />
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl relative z-10">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="relative z-10">
            <p className="text-xs text-[#a1a1aa] uppercase font-bold tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-extrabold text-white">{lowStockProducts.length}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Section */}
      <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#27272a] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Low Stock Products
          </h2>
          <Link href="/admin/products" className="text-sm font-bold text-violet-400 hover:text-violet-300">
            Manage Inventory &rarr;
          </Link>
        </div>
        
        <div className="divide-y divide-[#27272a]">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map(product => (
              <div key={product.id} className="p-6 flex items-center justify-between hover:bg-[#18181b]/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-white text-sm">{product.name}</h3>
                  <p className="text-xs text-[#71717a] font-mono mt-0.5">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rose-400">
                    {formatQuantity(Number(product.stockQuantityBase), product.baseUnit)}
                  </p>
                  <p className="text-[10px] text-[#71717a] uppercase tracking-wider font-bold mt-1">Remaining</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-[#a1a1aa]">
              <CheckCircle className="h-10 w-10 mx-auto text-emerald-400/50 mb-3" />
              <p>All products are sufficiently stocked.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import { CheckCircle } from "lucide-react";
