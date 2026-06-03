"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 border-r border-[#27272a] bg-[#0c0c0e] p-6 hidden lg:flex flex-col fixed h-full z-10">
      <div className="mb-8">
        <h1 className="font-bold text-lg leading-tight text-white">AASA MEDCHEM</h1>
        <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Admin Portal</span>
      </div>
      
      <nav className="space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? "bg-violet-600/10 border-l-2 border-violet-500 text-white font-medium" 
                  : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : ""}`} /> 
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="pt-4 border-t border-[#27272a] space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#18181b] text-sm transition-colors">
          Switch to User View
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm transition-colors text-left"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
