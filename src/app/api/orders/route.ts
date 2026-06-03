import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUnit, getConversionFactor, type DisplayUnit } from "@/lib/units";

interface OrderItemPayload {
  productId: string;
  quantity: number;
  unit: DisplayUnit;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const { items } = (await req.json()) as { items: OrderItemPayload[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    // Process order in a transaction to ensure all stock updates and order creation succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      let totalOrderPaise = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (item.quantity <= 0) {
          throw new Error(`Quantity for ${product.name} must be greater than 0`);
        }

        const quantityInBaseUnits = item.quantity * getConversionFactor(item.unit);
        
        if (Number(product.stockQuantityBase) < quantityInBaseUnits) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Price Calculation Logic
        // -----------------------
        // If ITEM, price = quantity * basePrice
        // If GRAM/MILLILITER, price = (quantity / 1000) * basePrice (since basePrice is per 1000 base units)
        const basePrice = Number(product.basePricePaise);
        let itemTotalPaise = 0;
        
        if (product.baseUnit === "ITEM") {
          itemTotalPaise = Math.round(quantityInBaseUnits * basePrice);
        } else {
          itemTotalPaise = Math.round((quantityInBaseUnits * basePrice) / 1000);
        }

        totalOrderPaise += itemTotalPaise;

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantityBase: {
              decrement: quantityInBaseUnits
            }
          }
        });

        orderItemsData.push({
          productId: product.id,
          quantityBase: quantityInBaseUnits,
          unitOrdered: getBaseUnit(item.unit), // Store the base unit enum representation of what they ordered, but wait schema wants BaseUnit Enum
          displayUnitOrdered: item.unit, // e.g. "kg", "L"
          unitDisplayQuantity: item.quantity, // Store exactly what they typed
          unitPricePaiseAtOrder: product.basePricePaise, // Snapshot the price
        });
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          totalPaise: BigInt(totalOrderPaise),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    // Serialize BigInts before returning
    const serializedOrder = {
      ...order,
      totalPaise: order.totalPaise.toString(),
      items: order.items.map(i => ({
        ...i,
        quantityBase: Number(i.quantityBase),
        unitDisplayQuantity: Number(i.unitDisplayQuantity),
        unitPricePaiseAtOrder: i.unitPricePaiseAtOrder.toString(),
      }))
    };

    return NextResponse.json(serializedOrder, { status: 201 });

  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
