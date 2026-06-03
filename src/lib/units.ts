// ──────────────────────────────────────────────────────────────
// Unit Conversion & Formatting Utilities
// ──────────────────────────────────────────────────────────────
//
// DATA FLOW CONCEPT:
//
//   Form (user-friendly)    →    API Route    →    Database (base units)
//   ─────────────────────        ──────────        ──────────────────────
//   "2.5 kg"                →    toBaseUnit()  →   2500 (grams)
//   "₹49.99"                →    × 100         →   4999 (paise BigInt)
//   "1.5 L"                 →    toBaseUnit()  →   1500 (milliliters)
//
//   Database (base units)   →    API Route     →   Form (user-friendly)
//   ─────────────────────        ──────────        ──────────────────────
//   2500 (grams)            →   fromBaseUnit() →   "2.50 kg"
//   4999 (paise)            →   ÷ 100          →   "₹49.99"
//
// BASE UNITS in DB:
//   Weight → grams (GRAM)
//   Volume → milliliters (MILLILITER)
//   Count  → items (ITEM)
// ──────────────────────────────────────────────────────────────

/** The display units users can pick from in forms */
export type DisplayUnit = "g" | "kg" | "mL" | "L" | "item";

/** Maps each display unit to its base unit enum + conversion factor */
const UNIT_MAP: Record<DisplayUnit, { baseUnit: "GRAM" | "MILLILITER" | "ITEM"; factor: number }> = {
  g:    { baseUnit: "GRAM",       factor: 1 },
  kg:   { baseUnit: "GRAM",       factor: 1000 },
  mL:   { baseUnit: "MILLILITER", factor: 1 },
  L:    { baseUnit: "MILLILITER", factor: 1000 },
  item: { baseUnit: "ITEM",       factor: 1 },
};

/**
 * Convert a user-entered value to the database base unit.
 *
 * Example: toBaseUnit(2.5, "kg") → 2500 (grams stored in DB)
 */
export function toBaseUnit(value: number, displayUnit: DisplayUnit): number {
  const mapping = UNIT_MAP[displayUnit];
  if (!mapping) throw new Error(`Unknown display unit: ${displayUnit}`);
  return value * mapping.factor;
}

/**
 * Convert a database base-unit value back to a human-friendly number.
 *
 * Example: fromBaseUnit(2500, "GRAM") → { value: 2.5, displayUnit: "kg" }
 *
 * Auto-selects the best display unit:
 *   ≥ 1000 g  → kg     |   < 1000 g  → g
 *   ≥ 1000 mL → L      |   < 1000 mL → mL
 *   ITEM      → item
 */
export function fromBaseUnit(baseValue: number, baseUnit: "GRAM" | "MILLILITER" | "ITEM"): {
  value: number;
  displayUnit: DisplayUnit;
} {
  switch (baseUnit) {
    case "GRAM":
      if (baseValue >= 1000) return { value: baseValue / 1000, displayUnit: "kg" };
      return { value: baseValue, displayUnit: "g" };
    case "MILLILITER":
      if (baseValue >= 1000) return { value: baseValue / 1000, displayUnit: "L" };
      return { value: baseValue, displayUnit: "mL" };
    case "ITEM":
      return { value: baseValue, displayUnit: "item" };
    default:
      return { value: baseValue, displayUnit: "item" };
  }
}

/**
 * Get the base unit enum for a given display unit.
 *
 * Example: getBaseUnit("kg") → "GRAM"
 */
export function getBaseUnit(displayUnit: DisplayUnit): "GRAM" | "MILLILITER" | "ITEM" {
  return UNIT_MAP[displayUnit].baseUnit;
}

/**
 * Format a base-unit quantity into a human-readable string.
 *
 * Example: formatQuantity(2500, "GRAM") → "2.50 kg"
 * Example: formatQuantity(500, "MILLILITER") → "500 mL"
 * Example: formatQuantity(12, "ITEM") → "12 items"
 */
export function formatQuantity(baseValue: number, baseUnit: "GRAM" | "MILLILITER" | "ITEM"): string {
  const { value, displayUnit } = fromBaseUnit(baseValue, baseUnit);

  if (displayUnit === "item") {
    return `${value} item${value !== 1 ? "s" : ""}`;
  }

  // Show up to 2 decimal places, but strip trailing zeros
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${formatted} ${displayUnit}`;
}

/**
 * Format paise (BigInt or number) to INR currency string.
 *
 * Example: formatPriceINR(4999) → "₹49.99"
 * Example: formatPriceINR(BigInt(10000)) → "₹100.00"
 */
export function formatPriceINR(paise: number | bigint): string {
  const numericPaise = typeof paise === "bigint" ? Number(paise) : paise;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPaise / 100);
}

/**
 * Convert an INR amount (from form input) to paise for DB storage.
 *
 * Example: toPaise(49.99) → 4999
 */
export function toPaise(inr: number): number {
  return Math.round(inr * 100);
}

/** List of display units grouped for form select dropdowns */
export const DISPLAY_UNIT_OPTIONS: { value: DisplayUnit; label: string; group: string }[] = [
  { value: "g",    label: "Grams (g)",       group: "Weight" },
  { value: "kg",   label: "Kilograms (kg)",  group: "Weight" },
  { value: "mL",   label: "Milliliters (mL)", group: "Volume" },
  { value: "L",    label: "Liters (L)",       group: "Volume" },
  { value: "item", label: "Items",            group: "Count" },
];

/**
 * Get all display units that are compatible with a given base unit.
 * Used to populate unit selectors for a specific product.
 */
export function getCompatibleUnits(baseUnit: "GRAM" | "MILLILITER" | "ITEM"): { value: DisplayUnit; label: string }[] {
  return DISPLAY_UNIT_OPTIONS.filter((opt) => getBaseUnit(opt.value) === baseUnit);
}

/**
 * Get the conversion factor for a display unit to its base unit.
 */
export function getConversionFactor(displayUnit: DisplayUnit): number {
  return UNIT_MAP[displayUnit].factor;
}
