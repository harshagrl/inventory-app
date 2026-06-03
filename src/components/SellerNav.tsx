"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, LogOut, Layers } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SellerNav() {
  const pathname = usePathname();

  const links = [
    { name: "Browse Products", href: "/dashboard/products", icon: Package },
    { name: "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
  ];

  return (
    <header className="bg-[#0c0c0e] border-b border-[#27272a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center flex-shrink-0 cursor-pointer">
            <Layers className="h-6 w-6 text-violet-500 mr-2" />
            <span className="font-bold text-lg tracking-tight text-white">AASA MEDCHEM</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#18181b] text-[#a1a1aa] uppercase tracking-wider hidden sm:block">
              Seller
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-violet-600/10 text-violet-400 font-medium"
                      : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="flex items-center">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
