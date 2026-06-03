"use client";

import React, { useState } from "react";
import { Package, ShoppingBag, AlertTriangle, Search, TrendingUp, Clock, Layers } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface Product {
  id: string; name: string; description: string | null; sku: string;
  category: string; baseUnit: "GRAM" | "MILLILITER" | "ITEM";
  basePricePaise: string; stockQuantityBase: string;
}

interface OrderItem {
  id: string; quantityBase: string; unitOrdered: string;
  unitPricePaiseAtOrder: string; product: { name: string };
}

interface Order {
  id: string; status: string; totalPaise: string; notes: string | null;
  createdAt: string; user: { name: string | null; email: string };
  items: OrderItem[];
}

interface Props { initialProducts: Product[]; initialOrders: Order[]; }

export default function DashboardView({ initialProducts, initialOrders }: Props) {
  const { data: session } = useSession();
  const [products] = useState<Product[]>(initialProducts);
  const [orders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  const formatPrice = (paiseStr: string) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(paiseStr) / 100);
  };

  const formatQuantity = (qtyStr: string, unit: string) => {
    const qty = Number(qtyStr);
    if (unit === "GRAM") return `${(qty / 1000).toFixed(2)} kg`;
    if (unit === "MILLILITER") return `${(qty / 1000).toFixed(2)} L`;
    return `${qty} items`;
  };

  const getUnitLabel = (unit: string) => unit === "GRAM" ? "kg" : unit === "MILLILITER" ? "L" : "unit";

  const lowStock = (p: Product) => {
    const qty = Number(p.stockQuantityBase);
    return (p.baseUnit === "ITEM") ? qty < 100 : qty < 20000;
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const match = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    return match && (selectedCategory === "ALL" || p.category === selectedCategory);
  });

  const totalValue = products.reduce((acc, p) => {
    const price = Number(p.basePricePaise), qty = Number(p.stockQuantityBase);
    return acc + (p.baseUnit === "ITEM" ? price * qty : (price * qty) / 1000);
  }, 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#27272a] bg-[#0c0c0e] p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">AASA MEDCHEM</h1>
              <span className="text-xs text-[#a1a1aa] uppercase tracking-wider">v14 App Router</span>
            </div>
          </div>
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-600/10 border-l-2 border-violet-500 text-white font-medium text-sm">
              <TrendingUp className="h-4 w-4 text-violet-400" /> Dashboard
            </a>
            {session?.user?.role === "ADMIN" && (
              <a href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-sm">
                <Package className="h-4 w-4" /> Admin Panel
              </a>
            )}
          </nav>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-[#18181b] rounded-xl border border-[#27272a] text-xs">
            <p className="font-semibold text-white">{session?.user?.name || session?.user?.email}</p>
            <p className="text-[#a1a1aa]">Role: <span className="text-violet-400 font-bold">{session?.user?.role}</span></p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full py-2 text-xs font-semibold text-[#a1a1aa] hover:text-rose-400 border border-[#27272a] rounded-lg hover:border-rose-500/30 transition-all">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <header>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Control Panel</h2>
          <p className="text-sm text-[#a1a1aa]">Real-time inventory & order management</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Products", value: products.length, icon: Package, color: "violet" },
            { label: "Inventory Value", value: formatPrice(totalValue.toString()), icon: TrendingUp, color: "emerald" },
            { label: "Low Stock", value: products.filter(lowStock).length, icon: AlertTriangle, color: "amber" },
            { label: "Orders", value: orders.length, icon: ShoppingBag, color: "indigo" },
          ].map((card) => (
            <div key={card.label} className="bg-[#0c0c0e] p-6 rounded-2xl border border-[#27272a] hover:border-opacity-50 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 bg-${card.color}-500/10 rounded-xl text-${card.color}-400`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white">{card.value}</h3>
            </div>
          ))}
        </section>

        {/* Product Table */}
        <section className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Inventory Stock Levels</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a1a1aa]" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div className="flex gap-1 bg-[#18181b] p-1 border border-[#27272a] rounded-xl overflow-x-auto">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-violet-600 text-white" : "text-[#a1a1aa] hover:text-white"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#18181b]/30">
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase">Product</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase">SKU</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase">Unit Price</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase text-right">Stock</th>
                  <th className="p-4 text-xs font-semibold text-[#a1a1aa] uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filtered.map((p) => {
                  const isLow = lowStock(p), outOfStock = Number(p.stockQuantityBase) === 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#18181b]/20 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white text-sm">{p.name}</div>
                        <div className="text-xs text-[#a1a1aa] mt-0.5 line-clamp-1 max-w-xs">{p.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono bg-[#18181b] border border-[#27272a] px-2 py-1 rounded text-gray-300">{p.sku}</span>
                        <div className="text-xs text-violet-400 mt-1 font-semibold">{p.category}</div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">
                        {formatPrice(p.basePricePaise)}<span className="text-[10px] text-[#a1a1aa]"> / {getUnitLabel(p.baseUnit)}</span>
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-white">{formatQuantity(p.stockQuantityBase, p.baseUnit)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${outOfStock ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : isLow ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                          {outOfStock ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <Clock className="h-5 w-5 text-[#a1a1aa]" />
          </div>
          <div className="space-y-3">
            {orders.length > 0 ? orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-[#18181b]/50 rounded-xl border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-400 font-mono">#{ord.id.slice(-8)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">{ord.status}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{ord.items[0]?.product.name || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">{formatPrice(ord.totalPaise)}</div>
                  <div className="text-[10px] text-[#a1a1aa]">{new Date(ord.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div className="text-center p-8 text-[#71717a] border-2 border-dashed border-[#27272a] rounded-xl">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
