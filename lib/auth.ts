/**
 * Shared NextAuth configuration. Exported separately from the route
 * handler so API routes can call `getServerSession(authOptions)` to
 * validate the admin session before touching the database.
 */
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * A precomputed bcrypt hash of a value nobody will ever submit as a
 * password. Used as the comparison target when no matching admin account
 * exists, so `bcrypt.compare` always runs (same cost factor, same rough
 * duration) regardless of whether the email is registered — this closes a
 * timing side-channel that would otherwise let an attacker enumerate valid
 * admin emails by measuring response latency (missing user = fast `null`,
 * wrong password = slow `bcrypt.compare`).
 */
const DUMMY_PASSWORD_HASH =
  "$2b$10$MyQ3R9fIbqZNbeo9JCW.he4uPZioXWNkhvUAij8HdS/wbOhfHp.j2";

// 20/15min per email+IP comfortably throttles credential-stuffing/brute-force
// scripts (which typically attempt far more than this) while staying well
// above the number of legitimate logins our own E2E suite performs against
// the single seeded admin account within one test run.
const LOGIN_RATE_LIMIT = 20;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const authOptions: AuthOptions = {
  secret: config.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const forwardedFor = req?.headers?.["x-forwarded-for"];
        const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
          ?.split(",")[0]
          ?.trim();
        const rateLimitKey = `login:${credentials.email.toLowerCase()}:${ip ?? "unknown"}`;

        if (!checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT, LOGIN_RATE_LIMIT_WINDOW_MS)) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email },
        });

        // Always run bcrypt.compare — even when no user was found — against
        // a fixed dummy hash, so the response timing is the same whether or
        // not the email belongs to a real admin account. This prevents an
        // attacker from enumerating valid admin emails via timing analysis
        // (missing user used to return instantly; wrong password took the
        // full ~10ms+ bcrypt cost).
        const hashToCompare = admin?.password ?? DUMMY_PASSWORD_HASH;
        const isValid = await bcrypt.compare(credentials.password, hashToCompare);

        if (!admin || !isValid) {
          return null;
        }

        return { id: admin.id, email: admin.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
