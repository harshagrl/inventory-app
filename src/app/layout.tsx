import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AASA MEDCHEM — Neon & Prisma Inventory System",
  description: "Next.js 14 Hackathon inventory and order management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* AuthSessionProvider is a Client Component wrapper around
            NextAuth's <SessionProvider>. It injects the session
            context so any child component can call useSession().
            The layout itself stays a Server Component. */}
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a'
            }
          }} />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
