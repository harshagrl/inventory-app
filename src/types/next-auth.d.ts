// ──────────────────────────────────────────────────────────────
// NextAuth.js Type Augmentation
// ──────────────────────────────────────────────────────────────
//
// WHY do we need this?
// By default, NextAuth's Session type only has:
//   session.user.name
//   session.user.email
//   session.user.image
//
// We added `id` and `role` in our JWT/session callbacks, but
// TypeScript doesn't know about them. This file uses "module
// augmentation" to extend the built-in types so that
// `session.user.id` and `session.user.role` are fully typed
// everywhere in your codebase.
//
// This is a .d.ts (declaration) file — it contains NO runtime
// code, only type information. TypeScript picks it up
// automatically as long as it's inside a directory covered by
// your tsconfig.json `include` paths (which "**/*.ts" does).
// ──────────────────────────────────────────────────────────────

import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}
