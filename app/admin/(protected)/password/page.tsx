import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChangePasswordFormClient } from "./ChangePasswordFormClient";

export const dynamic = "force-dynamic";

export default async function AdminPasswordPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="mb-2 font-heading text-xl text-brown-deep">Change password</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-warm">
        Update the password for your admin account
        {session?.user?.email ? ` (${session.user.email})` : ""}. You&apos;ll need
        your current password to confirm the change.
      </p>
      <ChangePasswordFormClient />
    </div>
  );
}
