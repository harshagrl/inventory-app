// ──────────────────────────────────────────────────────────────
// NextAuth.js Configuration
// ──────────────────────────────────────────────────────────────
//
// WHY a separate file?
// In Next.js App Router, the API route file (route.ts) must only
// export HTTP method handlers (GET, POST). But we also need
// access to the `authOptions` object in server components and
// middleware. Extracting it here lets us import it from anywhere.
// ──────────────────────────────────────────────────────────────

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // ─── Session Strategy ──────────────────────────────────────
  // "jwt" means the session data lives in an encrypted cookie,
  // NOT in your database. This is simpler and faster — no
  // Session table lookups on every request.
  session: {
    strategy: "jwt",
  },

  // ─── Pages ─────────────────────────────────────────────────
  // Tell NextAuth to use our custom login page instead of the
  // ugly default one at /api/auth/signin
  pages: {
    signIn: "/login",
  },

  // ─── Providers ─────────────────────────────────────────────
  // "Providers" are the ways a user can authenticate.
  // We use CredentialsProvider = email + password form.
  // You could add Google, GitHub, etc. later.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // These `credentials` define what fields appear on the
      // auto-generated sign-in form (we won't use it since we
      // have a custom /login page, but NextAuth requires it).
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // `authorize` is called when the user submits the login form.
      // Return a user object on success, or null on failure.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // 1. Look up the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // No user found, or user was created via OAuth (no password)
          throw new Error("Invalid email or password");
        }

        // 2. Compare the submitted password with the stored hash
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // 3. Return the user object — this becomes the `user`
        //    parameter in the `jwt` callback below.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // ─── Callbacks ─────────────────────────────────────────────
  // Callbacks let you hook into the auth lifecycle.
  // We use them to attach `id` and `role` to the JWT token
  // and then copy them into the session object.
  callbacks: {
    // Called whenever a JWT is created (sign-in) or updated
    // (session refresh). The `user` param is only present on
    // initial sign-in — after that, `token` carries everything.
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: copy user fields into the token
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    // Called whenever `useSession()` or `getServerSession()` reads
    // the session. We copy our custom fields from the token into
    // the session object so they're available in components.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
