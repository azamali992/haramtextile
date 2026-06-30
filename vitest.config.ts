import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest config for API route + unit tests.
 *
 * Why Vitest over Jest: this project is Next.js 14 App Router + TypeScript
 * with native ESM throughout (`zod`, `next-auth`, the generated Prisma
 * client). Vitest uses Vite's transform pipeline, so TS/ESM "just works"
 * with zero extra babel/ts-jest config, it's noticeably faster (esbuild
 * transforms + smart watch mode), and its API is Jest-compatible
 * (describe/it/expect/vi.mock) so there's no real learning-curve cost.
 *
 * Playwright (separate config) owns true E2E/browser tests; Vitest owns
 * everything that can run in Node against route handlers + a real Postgres
 * test database.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: false,
    include: ["tests/api/**/*.test.ts", "tests/unit/**/*.test.ts", "tests/sitemap/**/*.test.ts"],
    setupFiles: ["tests/helpers/setup-env.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    // Integration tests share one Postgres test DB — run files serially to
    // avoid cross-test data races (e.g. two files both clearing/seeding
    // the same tables concurrently).
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["app/api/**", "lib/**"],
      exclude: ["lib/generated/**"],
    },
  },
});
