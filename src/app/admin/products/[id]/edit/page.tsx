// ──────────────────────────────────────────────────────────────
// Edit Product — Server + Client component flow
// ──────────────────────────────────────────────────────────────
// This file acts as the server-side data fetcher which then
// passes initial data to a Client Component form (reused or
// similar to the new product form).
// ──────────────────────────────────────────────────────────────

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditProductForm from "@/components/EditProductForm";

interface EditProductPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    redirect("/admin/products");
  }

  // Serialize the product data to pass to the client component
  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    sku: product.sku,
    category: product.category,
    baseUnit: product.baseUnit,
    basePricePaise: product.basePricePaise.toString(),
    stockQuantityBase: Number(product.stockQuantityBase),
  };

  return <EditProductForm initialData={serializedProduct} />;
}
