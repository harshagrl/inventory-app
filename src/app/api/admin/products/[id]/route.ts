// ──────────────────────────────────────────────────────────────
// Admin Single Product API — PUT (update) & DELETE
// ──────────────────────────────────────────────────────────────
//
// WHY [id] folder?
// In App Router, dynamic route segments use square brackets.
// A request to /api/admin/products/abc123 matches this file,
// and "abc123" is available as params.id.
//
// This is similar to Express:
//   router.put("/products/:id", handler)
//   router.delete("/products/:id", handler)
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBaseUnit, getBaseUnit, toPaise, type DisplayUnit } from "@/lib/units";

interface RouteParams {
  params: { id: string };
}

// ─── PUT /api/admin/products/[id] ────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;

  // Check product exists
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, description, sku, category, priceINR, quantity, displayUnit } = body;

  // Build update data — only include fields that were sent
  const updateData: Record<string, unknown> = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (category !== undefined) updateData.category = category.trim();

  // SKU change — check uniqueness against other products
  if (sku !== undefined && sku !== existing.sku) {
    const skuTaken = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });
    if (skuTaken && skuTaken.id !== id) {
      return NextResponse.json({ error: `SKU "${sku}" already in use` }, { status: 409 });
    }
    updateData.sku = sku.trim().toUpperCase();
  }

  // Price update — convert INR → paise
  if (priceINR !== undefined) {
    if (isNaN(Number(priceINR)) || Number(priceINR) <= 0) {
      return NextResponse.json({ error: "priceINR must be a positive number" }, { status: 400 });
    }
    updateData.basePricePaise = BigInt(toPaise(Number(priceINR)));
  }

  // Quantity + unit update
  if (quantity !== undefined && displayUnit !== undefined) {
    if (isNaN(Number(quantity)) || Number(quantity) < 0) {
      return NextResponse.json({ error: "quantity must be non-negative" }, { status: 400 });
    }
    updateData.stockQuantityBase = toBaseUnit(Number(quantity), displayUnit as DisplayUnit);
    updateData.baseUnit = getBaseUnit(displayUnit as DisplayUnit);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    sku: updated.sku,
    baseUnit: updated.baseUnit,
    basePricePaise: updated.basePricePaise.toString(),
    stockQuantityBase: Number(updated.stockQuantityBase),
  });
}

// ─── DELETE /api/admin/products/[id] ─────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if product has any order items (Prisma schema uses onDelete: Restrict)
  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderItemCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: product has ${orderItemCount} order record(s)` },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true, deletedId: id });
}
