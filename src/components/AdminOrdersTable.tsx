"use client";

import React, { useState } from "react";
import { formatPriceINR, formatQuantity } from "@/lib/units";
import { ChevronDown, ChevronUp, Package, User, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

type OrderItem = {
  id: string;
  quantityBase: number;
  unitOrdered: string;
  displayUnitOrdered: string;
  unitDisplayQuantity: number;
  unitPricePaiseAtOrder: string;
  product: { name: string };
};

type Order = {
  id: string;
  status: string;
  totalPaise: string;
  createdAt: string;
  notes: string | null;
  user: { name: string | null; email: string };
  items: OrderItem[];
};

export default function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "CONFIRMED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SHIPPED": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CANCELLED": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-[#18181b] text-[#a1a1aa] border-[#27272a]";
    }
  };

  const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#18181b] border-b border-[#27272a] text-xs uppercase tracking-wider text-[#a1a1aa] font-bold">
              <th className="p-4 w-10"></th>
              <th className="p-4">Order ID & Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-[#71717a]">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No orders found.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  {/* Main Row */}
                  <tr className="hover:bg-[#18181b]/50 transition-colors group">
                    <td className="p-4">
                      <button 
                        onClick={() => toggleRow(order.id)}
                        className="p-1 rounded-md hover:bg-[#27272a] text-[#71717a] hover:text-white transition-colors"
                      >
                        {expandedRows.has(order.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-white mb-1">#{order.id.slice(-8)}</div>
                      <div className="text-xs text-[#71717a]">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#71717a]" />
                        <span className="text-sm font-medium text-white">{order.user.name || "Unknown"}</span>
                      </div>
                      <div className="text-xs text-[#a1a1aa] mt-1 ml-6">{order.user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-emerald-400">
                        {formatPriceINR(BigInt(order.totalPaise))}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === order.id && <Loader2 className="h-4 w-4 animate-spin text-violet-500" />}
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="bg-[#18181b] border border-[#27272a] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Items Row */}
                  {expandedRows.has(order.id) && (
                    <tr className="bg-[#18181b]/30">
                      <td colSpan={6} className="p-0 border-b-2 border-violet-500/20">
                        <div className="p-6 ml-10">
                          <h4 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider mb-4">Order Items Validation</h4>
                          <div className="space-y-3">
                            {order.items.map(item => {
                              // Item price logic: depending on what was ordered vs base unit
                              // We just display the calculated equivalent directly so admin can verify
                              const equivalentBase = formatQuantity(item.quantityBase, item.unitOrdered as "GRAM" | "MILLILITER" | "ITEM");
                              // A robust way to display:
                              return (
                                <div key={item.id} className="bg-[#0c0c0e] p-4 rounded-xl border border-[#27272a] flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex-1 min-w-[200px]">
                                    <div className="font-bold text-white text-sm mb-1">{item.product.name}</div>
                                    <div className="text-xs text-[#a1a1aa]">
                                      Price per base unit at time of order: {formatPriceINR(BigInt(item.unitPricePaiseAtOrder))}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 flex-1 min-w-[250px]">
                                    <span className="block text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1.5">Conversion Verification</span>
                                    <div className="flex items-center gap-3 text-sm">
                                      <div className="flex flex-col">
                                        <span className="text-[#a1a1aa] text-xs">User Input:</span>
                                        <span className="font-semibold text-white">{item.unitDisplayQuantity} {item.displayUnitOrdered || "units"}</span>
                                      </div>
                                      <div className="text-[#71717a]">→</div>
                                      <div className="flex flex-col">
                                        <span className="text-[#a1a1aa] text-xs">System Equivalent:</span>
                                        <span className="font-semibold text-emerald-400">{equivalentBase}</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                          {order.notes && (
                            <div className="mt-4 p-4 bg-[#18181b] border border-[#27272a] rounded-xl">
                              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider block mb-1">Customer Notes</span>
                              <p className="text-sm text-white italic">&quot;{order.notes}&quot;</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
