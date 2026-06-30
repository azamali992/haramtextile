/**
 * Mocks `lib/require-admin.ts`'s `requireAdminSession` so route-handler
 * tests can simulate an authenticated admin session without needing a
 * real NextAuth JWT cookie. Used by the "no session -> 401" tests (mocking
 * a null return) and the "valid session -> success" tests (mocking a
 * realistic Session object).
 *
 * IMPORTANT: this only covers the *unit* layer (does this individual route
 * call the guard and respect its result?). The Playwright E2E admin-login
 * test below additionally proves the real NextAuth credential flow works
 * end-to-end with a real session cookie, and the cross-route "every admin
 * route 401s with zero session mocking" sweep proves the guard is wired
 * into every handler without relying on mocks at all.
 */
import { vi } from "vitest";
import type { Session } from "next-auth";

export const MOCK_ADMIN_SESSION: Session = {
  user: { id: "test-admin-id", email: "qa-admin@haramtextile.com" } as Session["user"] & {
    id: string;
  },
  expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

vi.mock("@/lib/require-admin", () => ({
  requireAdminSession: vi.fn(),
}));

export async function mockAuthenticated() {
  const { requireAdminSession } = await import("@/lib/require-admin");
  vi.mocked(requireAdminSession).mockResolvedValue(MOCK_ADMIN_SESSION);
}

export async function mockUnauthenticated() {
  const { requireAdminSession } = await import("@/lib/require-admin");
  vi.mocked(requireAdminSession).mockResolvedValue(null);
}
