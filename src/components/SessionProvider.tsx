// ──────────────────────────────────────────────────────────────
// NextAuth Session Provider Wrapper
// ──────────────────────────────────────────────────────────────
//
// WHY a separate wrapper component?
// NextAuth's <SessionProvider> uses React Context, which
// requires the "use client" directive. But `layout.tsx` is a
// Server Component by default — and we want to keep it that way
// because it can do server-side data fetching.
//
// Solution: Create a thin Client Component wrapper that ONLY
// handles the provider, and import it inside layout.tsx.
// The layout stays a Server Component, and its `children`
// (which can be either server or client components) get the
// session context injected around them.
//
// This is a very common pattern in Next.js 14 — you'll see it
// for any React Context provider (theme, auth, state management).
// ──────────────────────────────────────────────────────────────

"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
