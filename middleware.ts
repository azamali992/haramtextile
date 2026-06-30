import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protects every `/admin/*` route except the login page itself.
 *
 * Middleware runs in the Edge runtime and cannot call `getServerSession`
 * (which depends on Node-only APIs), so session validity is checked via
 * `getToken`, which reads and verifies the same NextAuth JWT cookie.
 * This is the first line of defense; `app/admin/layout.tsx` performs a
 * second, server-side check as defense in depth.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
