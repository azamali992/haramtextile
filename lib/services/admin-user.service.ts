import bcrypt from "bcryptjs";
import * as adminUserRepository from "@/lib/repositories/admin-user.repository";

/** Discriminated result so the route can map failures to precise responses. */
export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "invalid_current" };

/**
 * Changes the signed-in admin's password. Verifies the supplied current
 * password against the stored bcrypt hash before writing the new one (hashed
 * at cost factor 10, matching the seed/auth code).
 */
export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const admin = await adminUserRepository.findAdminById(adminId);
  if (!admin) {
    return { ok: false, reason: "not_found" };
  }

  const currentValid = await bcrypt.compare(currentPassword, admin.password);
  if (!currentValid) {
    return { ok: false, reason: "invalid_current" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await adminUserRepository.updateAdminPassword(adminId, hashed);
  return { ok: true };
}
