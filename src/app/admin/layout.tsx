import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users to the dashboard
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard/products");
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <AdminNav />
      {/* The main content area wrapper. Since AdminNav is fixed and 64 (16rem) wide on lg screens, we push content on lg screens */}
      <div className="flex-1 lg:ml-64 w-full">
        {children}
      </div>
    </div>
  );
}
