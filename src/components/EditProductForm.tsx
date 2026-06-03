"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Save, Loader2, AlertCircle } from "lucide-react";
import { DISPLAY_UNIT_OPTIONS, fromBaseUnit, type DisplayUnit } from "@/lib/units";

interface EditProductFormProps {
  initialData: {
    id: string;
    name: string;
    description: string;
    sku: string;
    category: string;
    baseUnit: "GRAM" | "MILLILITER" | "ITEM";
    basePricePaise: string;
    stockQuantityBase: number;
  };
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
  const router = useRouter();

  // Convert initial database formats back to form-friendly formats
  const { value: initialQty, displayUnit: initialDisplayUnit } = fromBaseUnit(
    initialData.stockQuantityBase,
    initialData.baseUnit
  );
  
  const initialPriceINR = (Number(initialData.basePricePaise) / 100).toFixed(2);

  const [form, setForm] = useState({
    name: initialData.name,
    description: initialData.description,
    sku: initialData.sku,
    category: initialData.category,
    priceINR: initialPriceINR,
    quantity: initialQty.toString(),
    displayUnit: initialDisplayUnit,
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
      const res = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "PUT",
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
        setError(data.error || "Failed to update product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — could not update product.");
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
              <h1 className="text-xl font-bold text-white">Edit Product</h1>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Update details for {initialData.sku}
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
              className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description" name="description" value={form.description} onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
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
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Category *
              </label>
              <input
                id="category" name="category" required value={form.category} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
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
                className="w-full pl-8 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Quantity + Unit row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">
                Stock Quantity *
              </label>
              <input
                id="quantity" name="quantity" type="number" step="0.001" min="0" required
                value={form.quantity} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
