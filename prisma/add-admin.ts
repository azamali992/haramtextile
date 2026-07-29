/**
 * Adds (or updates) an admin login in the AdminUser table, hashing the
 * password with bcrypt exactly as the seed/auth code does (cost factor 10).
 *
 * Upserts by email: creates the account if new, or resets the password if the
 * email already exists. Does NOT touch any other admin rows.
 *
 * Usage (email + password passed as args to keep them out of the file):
 *   npx tsx prisma/add-admin.ts "someone@example.com" "the-password"
 */
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local", override: true });

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const emailRaw = process.argv[2];
  const password = process.argv[3];

  if (!emailRaw || !password) {
    throw new Error('Usage: npx tsx prisma/add-admin.ts "email" "password"');
  }
  const email = emailRaw.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error(`"${email}" does not look like a valid email address.`);
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, password: hashed },
    update: { password: hashed },
  });

  console.log(
    existing
      ? `[add-admin] Updated password for existing admin: ${email}`
      : `[add-admin] Created new admin: ${email}`,
  );

  const all = await prisma.adminUser.findMany({ select: { email: true } });
  console.log(`[add-admin] Admin accounts now: ${all.map((a) => a.email).join(", ")}`);
}

main()
  .catch((error) => {
    console.error("[add-admin] Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
