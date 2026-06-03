// ──────────────────────────────────────────────────────────────
// Delete Product Button — Client Component
// ──────────────────────────────────────────────────────────────
// Extracted as a separate client component because the product
// list page is a Server Component (can't have onClick handlers).
// This is a common App Router pattern: server renders the table,
// client handles interactive buttons.
// ──────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product");
        return;
      }

      toast.success("Product deleted successfully");
      // Refresh the server component to re-fetch the product list
      router.refresh();
    } catch {
      toast.error("Network error — could not delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-transparent transition-all disabled:opacity-50"
    >
      {isDeleting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
    </button>
  );
}
