import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "../_components/AdminSidebar";

/**
 * Server-side session guard for every authenticated admin page (everything
 * except `/admin/login`, which lives outside this route group).
 * `middleware.ts` already blocks unauthenticated requests at the edge;
 * this is a second, defense-in-depth check using `getServerSession`
 * (middleware can only use the lighter-weight `getToken`) in case
 * middleware is ever bypassed or misconfigured.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen font-body text-sm text-brown-deep">
      <AdminSidebar />
      <main className="flex-1 bg-cream p-8">{children}</main>
    </div>
  );
}
