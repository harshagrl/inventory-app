"use client";

import { useState, useMemo, useEffect } from "react";
import { getCompatibleUnits, getConversionFactor, formatPriceINR, type DisplayUnit } from "@/lib/units";

interface Product {
  id: string;
  name: string;
  baseUnit: "GRAM" | "MILLILITER" | "ITEM";
  basePricePaise: string;
  stockQuantityBase: number;
}

interface OrderUnitSelectorProps {
  product: Product;
  onAddToCart: (item: { productId: string; quantity: number; unit: DisplayUnit; pricePaise: number }) => void;
}

export default function OrderUnitSelector({ product, onAddToCart }: OrderUnitSelectorProps) {
  const compatibleUnits = getCompatibleUnits(product.baseUnit);
  
  // Default to the first compatible unit (e.g., 'g' for GRAM, 'mL' for MILLILITER, 'item' for ITEM)
  const defaultUnit = compatibleUnits[1] ? compatibleUnits[1].value : compatibleUnits[0].value; // Prefer kg over g if available
  
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<DisplayUnit>(defaultUnit as DisplayUnit);

  // Price Calculation Logic
  // -----------------------
  // Formula: price = (quantity_in_base_unit / 1) × (base_price_paise / 100)
  // Wait, if it's per kg, the base price is per 1000g.
  // Actually, the prompt says: "Example: product is ₹500/kg (stored as 500000 paise per 1000g). User orders 500g → price = (500/1000) × 500 = ₹250"
  // But wait, the schema stores `base_price_paise`. Does it store price per 1 base unit, or price per 1000 base units?
  // Previous code (actions.ts/DashboardView.tsx) assumed:
  // "For GRAM/MILLILITER, the basePrice is stored per standard unit (e.g. 1000g or 1000ml)."
  // So: price = (quantity_in_base_units * base_price_paise) / 1000 (if GRAM/MILLILITER)
  // Or price = (quantity_in_base_units * base_price_paise) / 1 (if ITEM)
  
  const calculatedPricePaise = useMemo(() => {
    if (isNaN(quantity) || quantity <= 0) return 0;
    
    // 1. Convert user's selected quantity to base units
    const factor = getConversionFactor(selectedUnit);
    const quantityInBaseUnits = quantity * factor;
    
    // 2. Calculate total paise based on base unit type
    const basePrice = Number(product.basePricePaise);
    
    if (product.baseUnit === "ITEM") {
      // If it's an ITEM, price is simply quantity * price_per_item
      return Math.round(quantityInBaseUnits * basePrice);
    } else {
      // If GRAM or MILLILITER, basePrice is stored per 1000 base units (per kg or per L)
      return Math.round((quantityInBaseUnits * basePrice) / 1000);
    }
  }, [quantity, selectedUnit, product]);

  const maxStockInSelectedUnit = product.stockQuantityBase / getConversionFactor(selectedUnit);

  const handleAdd = () => {
    if (quantity > 0 && quantity <= maxStockInSelectedUnit) {
      onAddToCart({
        productId: product.id,
        quantity: quantity,
        unit: selectedUnit,
        pricePaise: calculatedPricePaise,
      });
      setQuantity(1); // Reset after adding
    }
  };

  return (
    <div className="mt-4 p-4 bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1 block">
            Quantity
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max={maxStockInSelectedUnit}
            value={quantity || ""}
            onChange={(e) => setQuantity(parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-[#0c0c0e] border border-[#27272a] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1 block">
            Unit
          </label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as DisplayUnit)}
            className="w-full px-3 py-2 bg-[#0c0c0e] border border-[#27272a] rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
          >
            {compatibleUnits.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#27272a] pt-3">
        <div>
          <span className="text-[10px] text-[#71717a] block">Calculated Total</span>
          <span className="text-sm font-bold text-emerald-400">
            {formatPriceINR(calculatedPricePaise)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!quantity || quantity <= 0 || quantity > maxStockInSelectedUnit}
          className="px-4 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/20 hover:border-transparent rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Quote
        </button>
      </div>
      
      {quantity > maxStockInSelectedUnit && (
        <p className="text-[10px] text-rose-400">
          Exceeds available stock ({maxStockInSelectedUnit.toFixed(2)} {selectedUnit})
        </p>
      )}
    </div>
  );
}
