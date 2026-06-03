import Link from "next/link";
import { Package, ShoppingCart, LayoutDashboard } from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-[#27272a] bg-[#0c0c0e] p-6 hidden lg:flex flex-col fixed h-full z-10">
      <div className="mb-8">
        <h1 className="font-bold text-lg leading-tight text-white">AASA MEDCHEM</h1>
        <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Admin Portal</span>
      </div>
      <nav className="space-y-2 flex-1">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-sm transition-colors">
          <LayoutDashboard className="h-4 w-4" /> Overview
        </Link>
        <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-sm transition-colors">
          <Package className="h-4 w-4" /> Products
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-sm transition-colors">
          <ShoppingCart className="h-4 w-4" /> Orders
        </Link>
      </nav>
      <div className="pt-4 border-t border-[#27272a]">
        <Link href="/dashboard" className="text-xs text-[#71717a] hover:text-[#a1a1aa]">
          Switch to User Dashboard
        </Link>
      </div>
    </aside>
  );
}
