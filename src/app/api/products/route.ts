import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUnit, type DisplayUnit } from "@/lib/units";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const unit = searchParams.get("unit") as DisplayUnit | null;

    // Build the where clause dynamically
    // Use Record<string, unknown> instead of any for safety
    const where: Record<string, unknown> = {
      // Only show products with stock > 0 to sellers
      stockQuantityBase: {
        gt: 0
      }
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (unit) {
      where.baseUnit = getBaseUnit(unit);
    }

    const products = await prisma.product.findMany({
      where: where,
      orderBy: { name: "asc" },
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
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
