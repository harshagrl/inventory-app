// ──────────────────────────────────────────────────────────────
// Create New Product — Client Component
// ──────────────────────────────────────────────────────────────
//
// DATA FLOW (Form Submit):
//
//   Form State                 fetch() POST body            API Route              Database
//   ──────────                 ────────────────              ─────────              ────────
//   name: "Almonds"           → name: "Almonds"           → name: "Almonds"      → name
//   priceINR: "799.50"        → priceINR: 799.5           → toPaise() = 79950    → base_price_paise: 79950n
//   quantity: "5"             → quantity: 5               → toBaseUnit(5,"kg")   → stock_quantity_base: 5000
//   displayUnit: "kg"        → displayUnit: "kg"         → getBaseUnit("kg")    → base_unit: "GRAM"
//   sku: "alm-001"           → sku: "alm-001"            → .toUpperCase()       → sku: "ALM-001"
//
// ──────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Shield, Package, Loader2, AlertCircle, CheckCircle,
} from "lucide-react";
import { DISPLAY_UNIT_OPTIONS } from "@/lib/units";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    priceINR: "",
    quantity: "",
    displayUnit: "kg",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          sku: form.sku,
          category: form.category,
          priceINR: parseFloat(form.priceINR),
          quantity: parseFloat(form.quantity),
          displayUnit: form.displayUnit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create product");
        return;
      }

      // Success — redirect to products list
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — could not create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Header */}
      <div className="border-b border-[#27272a] bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-400" />
              <h1 className="text-xl font-bold text-white">Add New Product</h1>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Fill in the details below — prices in INR, quantities in your preferred unit
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl p-8 space-y-6 shadow-xl"
        >
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Product Name *
            </label>
            <input
              id="name" name="name" required value={form.name} onChange={handleChange}
              placeholder="e.g. Basmati Rice Premium"
              className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description" name="description" value={form.description} onChange={handleChange}
              placeholder="Optional product description..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
            />
          </div>

          {/* SKU + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="sku" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                SKU Code *
              </label>
              <input
                id="sku" name="sku" required value={form.sku} onChange={handleChange}
                placeholder="e.g. BAS-RICE-001"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Category *
              </label>
              <input
                id="category" name="category" required value={form.category} onChange={handleChange}
                placeholder="e.g. Grains, Dairy, Spices"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Price in INR */}
          <div className="space-y-2">
            <label htmlFor="priceINR" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Price in ₹ (INR) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-sm text-[#71717a] font-semibold">₹</span>
              <input
                id="priceINR" name="priceINR" type="number" step="0.01" min="0.01" required
                value={form.priceINR} onChange={handleChange}
                placeholder="49.99"
                className="w-full pl-8 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <p className="text-[10px] text-[#71717a]">
              Stored as paise internally (₹49.99 → 4999 paise)
            </p>
          </div>

          {/* Quantity + Unit row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Initial Stock Quantity *
              </label>
              <input
                id="quantity" name="quantity" type="number" step="0.001" min="0" required
                value={form.quantity} onChange={handleChange}
                placeholder="e.g. 25"
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm placeholder-[#71717a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="displayUnit" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Unit *
              </label>
              <select
                id="displayUnit" name="displayUnit" value={form.displayUnit} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
              >
                {DISPLAY_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#71717a]">
                Converted to base unit in DB (kg → grams, L → mL)
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-rose-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 text-sm font-semibold text-[#a1a1aa] hover:text-white border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" /> Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
