import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard/products");
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-[#f4f4f5] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-8">
          <Layers className="h-16 w-16 text-violet-500 mb-4" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">AASA MEDCHEM</span>
        </h1>
        <p className="text-[#a1a1aa] mb-10 text-lg">
          The smart inventory and order management system for modern businesses.
        </p>

        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#09090b] rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl"
        >
          Sign In
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
