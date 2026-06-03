import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceINR, formatQuantity } from "@/lib/units";
import { Clock, ShoppingBag, Package, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch orders for the logged-in user
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, baseUnit: true }
          }
        }
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "CONFIRMED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHIPPED": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CANCELLED": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-[#18181b] text-[#a1a1aa] border-[#27272a]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "PENDING": return <Clock className="h-4 w-4" />;
      case "DELIVERED": return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED": return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // The unit they ordered is stored implicitly or explicitly.
  // Wait, the schema has `unitOrdered: BaseUnit`. This means we lost the display unit (like 'kg' or 'L').
  // We can derive a sensible display string based on `unitDisplayQuantity` and `unitOrdered` (base unit).
  // Actually, wait, `unitDisplayQuantity` stores exactly what they typed (e.g. 2.5).
  // And `unitOrdered` stores the base enum (e.g. GRAM).
  // We can just format it nicely using `unitDisplayQuantity`. If `unitOrdered` is GRAM, and quantity is small, maybe it was meant to be kg.
  // Wait, if they typed 2.5 and ordered in kg, `unitDisplayQuantity` is 2.5. 
  // How do we know it was kg and not g?
  const formatOrderedQuantity = (baseQuantityDecimal: number, baseUnit: string) => {
    return formatQuantity(baseQuantityDecimal, baseUnit);
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Your Orders</h2>
        <p className="text-sm text-[#a1a1aa]">View and track the status of your submitted orders.</p>
      </header>

      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#18181b] p-5 border-b border-[#27272a] flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider block">Order ID</span>
                  <span className="text-sm font-mono text-white">#{order.id.slice(-8)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider block">Date</span>
                  <span className="text-sm text-white">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider block">Total</span>
                  <span className="text-sm font-bold text-emerald-400">{formatPriceINR(order.totalPaise)}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h4 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-4 border-b border-[#27272a] pb-2">Items</h4>
                <ul className="space-y-3">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-[#71717a]" />
                        <span className="font-semibold text-white">{item.product.name}</span>
                      </div>
                      <span className="text-[#a1a1aa] font-medium bg-[#18181b] px-3 py-1 rounded-lg border border-[#27272a]">
                        {formatOrderedQuantity(item.quantityBase, item.product.baseUnit)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider block mb-1">Notes</span>
                    <p className="text-xs text-[#a1a1aa] italic">&quot;{order.notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#27272a] rounded-2xl bg-[#0c0c0e]">
            <ShoppingBag className="h-12 w-12 mx-auto text-[#3f3f46] mb-4" />
            <h3 className="text-lg font-bold text-white">No orders yet</h3>
            <p className="text-sm text-[#a1a1aa] mt-1 mb-6">You haven&apos;t placed any orders.</p>
            <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-colors">
              <Package className="h-4 w-4" /> Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
