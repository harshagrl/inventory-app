import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SellerNav from "@/components/SellerNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <SellerNav />
      {/* 
        The top navigation SellerNav is handled globally here.
        We don't want the individual pages to render another sidebar if they did before.
      */}
      {children}
    </div>
  );
}
