/**
 * Shared admin-session guard. Every handler under `app/api/admin/**` must
 * call this BEFORE any database read/write and return the resulting 401
 * response immediately if `session` is null. This is the single most
 * important security property of the admin API surface.
 */
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
