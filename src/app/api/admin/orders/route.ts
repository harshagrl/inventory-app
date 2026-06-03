import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  // Serialize BigInts and Decimals for JSON response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedOrders = orders.map((order: any) => ({
    ...order,
    totalPaise: order.totalPaise.toString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: order.items.map((item: any) => ({
      ...item,
      quantityBase: Number(item.quantityBase),
      unitDisplayQuantity: Number(item.unitDisplayQuantity),
      unitPricePaiseAtOrder: item.unitPricePaiseAtOrder.toString(),
    })),
  }));

  return NextResponse.json(serializedOrders);
}
