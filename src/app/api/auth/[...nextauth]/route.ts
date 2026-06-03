// ──────────────────────────────────────────────────────────────
// NextAuth.js API Route Handler
// ──────────────────────────────────────────────────────────────
//
// WHY route.ts?
// In the App Router, API endpoints are defined by creating a
// `route.ts` file inside a folder under `app/api/`. The folder
// path becomes the URL path.
//
// This file sits at: app/api/auth/[...nextauth]/route.ts
// Which means it handles ALL requests to /api/auth/*
//
// The [...nextauth] folder name is a "catch-all" dynamic segment.
// NextAuth needs this because it handles multiple sub-routes:
//   /api/auth/signin
//   /api/auth/signout
//   /api/auth/callback/credentials
//   /api/auth/session
//   etc.
//
// WHY export GET and POST separately?
// In the App Router, each HTTP method must be an explicit named
// export. The Pages Router used `export default handler` for all
// methods, but App Router requires this pattern.
// ──────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
