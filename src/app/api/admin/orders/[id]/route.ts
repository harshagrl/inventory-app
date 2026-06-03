import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { status } = await req.json();

    if (!status || !["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      ...order,
      totalPaise: order.totalPaise.toString(),
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
