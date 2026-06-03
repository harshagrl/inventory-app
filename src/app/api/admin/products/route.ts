// ──────────────────────────────────────────────────────────────
// Admin Products API — GET (list) & POST (create)
// ──────────────────────────────────────────────────────────────
//
// DATA FLOW (POST — Create Product):
//
//   Browser Form                    API Route (here)              Prisma → PostgreSQL
//   ────────────                    ────────────────              ──────────────────
//   name: "Basmati Rice"     →      Validate fields        →     name: "Basmati Rice"
//   priceINR: 49.99          →      toPaise(49.99) = 4999  →     base_price_paise: 4999n
//   quantity: 2.5            →      toBaseUnit(2.5,"kg")   →     stock_quantity_base: 2500
//   displayUnit: "kg"        →      getBaseUnit("kg")      →     base_unit: "GRAM"
//
// DATA FLOW (GET — List Products):
//
//   PostgreSQL → Prisma            API Route (here)              Browser
//   ────────────────────            ────────────────              ───────
//   base_price_paise: 4999n   →    .toString() for BigInt  →     "4999"
//   stock_quantity_base: 2500 →    Number() for Decimal    →     2500
//   base_unit: "GRAM"         →    pass through            →     "GRAM"
//
// WHY toString() on BigInt?
// JSON.stringify() can't serialize BigInt — it throws
// "TypeError: Do not know how to serialize a BigInt".
// So we convert to string here, and the client parses it.
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBaseUnit, getBaseUnit, toPaise, type DisplayUnit } from "@/lib/units";

// ─── GET /api/admin/products ─────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize BigInt & Decimal for JSON transport
  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    category: p.category,
    baseUnit: p.baseUnit,
    basePricePaise: p.basePricePaise.toString(),
    stockQuantityBase: Number(p.stockQuantityBase),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json(serialized);
}

// ─── POST /api/admin/products ────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, sku, category, priceINR, quantity, displayUnit } = body;

  // ── Validate required fields ─────────────────────────────
  const errors: string[] = [];
  if (!name || typeof name !== "string") errors.push("name is required");
  if (!sku || typeof sku !== "string") errors.push("sku is required");
  if (!category || typeof category !== "string") errors.push("category is required");
  if (priceINR === undefined || isNaN(Number(priceINR)) || Number(priceINR) <= 0) {
    errors.push("priceINR must be a positive number");
  }
  if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 0) {
    errors.push("quantity must be a non-negative number");
  }
  if (!displayUnit) errors.push("displayUnit is required (g, kg, mL, L, or item)");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  // ── Check SKU uniqueness ─────────────────────────────────
  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) {
    return NextResponse.json({ error: `SKU "${sku}" already exists` }, { status: 409 });
  }

  // ── Convert to DB storage format ─────────────────────────
  const basePricePaise = BigInt(toPaise(Number(priceINR)));
  const stockQuantityBase = toBaseUnit(Number(quantity), displayUnit as DisplayUnit);
  const baseUnit = getBaseUnit(displayUnit as DisplayUnit);

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      baseUnit,
      basePricePaise,
      stockQuantityBase,
    },
  });

  return NextResponse.json(
    {
      id: product.id,
      name: product.name,
      sku: product.sku,
      baseUnit: product.baseUnit,
      basePricePaise: product.basePricePaise.toString(),
      stockQuantityBase: Number(product.stockQuantityBase),
    },
    { status: 201 }
  );
}
