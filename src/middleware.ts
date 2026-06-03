// ──────────────────────────────────────────────────────────────
// Next.js Middleware — Route Protection
// ──────────────────────────────────────────────────────────────
//
// WHY middleware.ts at the src/ root?
// Next.js looks for middleware.ts (or middleware.js) in:
//   - Project root, OR
//   - Inside `src/` if you're using the src directory layout.
//
// It runs BEFORE every matching request hits your page/API code.
// Think of it like Express middleware, but it runs at the Edge
// (Vercel's edge network), so it's extremely fast.
//
// HOW withAuth WORKS:
// `withAuth` from next-auth/middleware wraps your middleware
// function with JWT verification. It:
//   1. Checks for a valid NextAuth JWT in the request cookies
//   2. If found, decodes it and passes it as `req.nextauth.token`
//   3. If NOT found, redirects to the `pages.signIn` URL
//
// The `authorized` callback returns true/false to allow/block.
// If it returns false, the user gets redirected to sign-in.
// ──────────────────────────────────────────────────────────────

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // This function runs AFTER the `authorized` callback returns
  // true. We use it for fine-grained role checks.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // /admin/* routes — ADMIN only
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        // User is authenticated but doesn't have ADMIN role.
        // Redirect them to the dashboard instead of showing a
        // forbidden error (better UX).
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // /dashboard/* routes — both ADMIN and SELLER can access.
    // No extra check needed here because the `authorized`
    // callback below already ensures the user is logged in.

    return NextResponse.next();
  },
  {
    callbacks: {
      // `authorized` runs BEFORE the middleware function above.
      // Return true = allow, false = redirect to sign-in page.
      authorized({ token }) {
        // If there's a valid JWT token, the user is authenticated.
        return !!token;
      },
    },
  }
);

// ─── Matcher ─────────────────────────────────────────────────
// `config.matcher` tells Next.js WHICH routes this middleware
// should run on. Without this, it would run on EVERY request
// (including static assets, images, _next files, etc.).
//
// We only protect /dashboard and /admin routes.
// The login page, API routes, and public pages are NOT protected.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
