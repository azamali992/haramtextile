/**
 * Shared test-database helpers for API integration tests.
 *
 * These tests run against a REAL Postgres instance (a temporary Docker
 * container per the project setup instructions), connected to via the
 * app's own `lib/prisma.ts` singleton so behavior matches production
 * exactly (same Prisma client, same driver adapter).
 */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** Deletes all rows from every table, in FK-safe order. Run between tests for isolation. */
export async function resetDatabase() {
  await prisma.contactSubmission.deleteMany();
  await prisma.clientLogo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.heroConfig.deleteMany();
  await prisma.aboutContent.deleteMany();
  await prisma.seoSettings.deleteMany();
  await prisma.adminUser.deleteMany();
}

export interface SeededAdmin {
  id: string;
  email: string;
  password: string;
}

/**
 * Creates a single admin user with a known plaintext password (hashed with
 * bcrypt, matching `lib/auth.ts`'s `authorize` callback) for tests that
 * need to exercise the real NextAuth credential flow end-to-end.
 */
export async function seedAdminUser(
  email = "qa-admin@haramtextile.com",
  plaintextPassword = "Qa-Test-Password-123!",
): Promise<SeededAdmin> {
  const hashed = await bcrypt.hash(plaintextPassword, 10);
  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, password: hashed },
    update: { password: hashed },
  });
  return { id: admin.id, email: admin.email, password: plaintextPassword };
}

export async function seedCategory(overrides: Partial<{ name: string; slug: string }> = {}) {
  return prisma.category.create({
    data: {
      name: overrides.name ?? "Test Category",
      slug: overrides.slug ?? `test-category-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    },
  });
}

export async function seedProduct(categoryId: string, overrides: Partial<{
  name: string;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
}> = {}) {
  return prisma.product.create({
    data: {
      name: overrides.name ?? "Test Product",
      description: overrides.description ?? "A test product description.",
      imageUrl: overrides.imageUrl ?? "https://res.cloudinary.com/test/image/upload/v1/test/product.jpg",
      imagePublicId: overrides.imagePublicId ?? "test/product",
      categoryId,
      tags: [],
    },
    include: { category: true },
  });
}

export async function seedCertification(overrides: Partial<{ name: string }> = {}) {
  return prisma.certification.create({
    data: {
      name: overrides.name ?? "Test Certification",
      description: "A test certification description.",
      issuingBody: "Test Issuing Body",
      imageUrl: "https://res.cloudinary.com/test/image/upload/v1/test/cert.jpg",
      imagePublicId: "test/cert",
    },
  });
}

export async function disconnect() {
  await prisma.$disconnect();
}
