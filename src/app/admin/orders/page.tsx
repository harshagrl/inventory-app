import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminOrdersTable from "@/components/AdminOrdersTable";

export const revalidate = 0; // Always fetch fresh data

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // We can fetch data server-side so it's ready on initial render
  // Let's use the local API URL, but in Server Components it's better to query Prisma directly.
  // I will just use Prisma directly here to avoid fetch() complications with absolute URLs.
  
  const { prisma } = await import("@/lib/prisma");

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedOrders = orders.map((order: any) => ({
    id: order.id,
    status: order.status,
    totalPaise: order.totalPaise.toString(),
    createdAt: order.createdAt.toISOString(),
    notes: order.notes,
    user: { name: order.user.name, email: order.user.email },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: order.items.map((item: any) => ({
      id: item.id,
      quantityBase: Number(item.quantityBase),
      unitOrdered: item.unitOrdered,
      displayUnitOrdered: item.displayUnitOrdered,
      unitDisplayQuantity: Number(item.unitDisplayQuantity),
      unitPricePaiseAtOrder: item.unitPricePaiseAtOrder.toString(),
      product: { name: item.product.name },
    })),
  }));

  return (
    <main className="p-6 md:p-10 overflow-y-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Order Management</h1>
        <p className="text-[#a1a1aa] text-sm">
          Review orders, verify unit conversions, and update fulfillment statuses.
        </p>
      </header>

      <AdminOrdersTable initialOrders={serializedOrders} />
    </main>
  );
}
