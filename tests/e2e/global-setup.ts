/**
 * Playwright global setup — runs once before the whole E2E suite.
 *
 * Delegates the actual DB reset/seed work to `seed-e2e-db.ts`, run as a
 * `tsx` child process. This indirection exists because Playwright's
 * bundled TS loader executes `global-setup.ts` itself in CJS mode, which
 * cannot import Prisma 7's generated client (genuine ESM, uses
 * `import.meta.url` internally) — `tsx` (the same runtime `npm run
 * db:seed` already relies on) handles it correctly as a separate process.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const E2E_ADMIN_EMAIL = "qa-admin@haramtextile.com";
export const E2E_ADMIN_PASSWORD = "Qa-Test-Password-123!";

export default async function globalSetup() {
  const scriptPath = join(__dirname, "seed-e2e-db.ts");
  execFileSync("npx", ["tsx", scriptPath], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      E2E_ADMIN_EMAIL,
      E2E_ADMIN_PASSWORD,
    },
  });
}
