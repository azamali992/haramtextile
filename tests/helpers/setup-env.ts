/**
 * Vitest global setup — loads `.env` (the test-only values pointed at the
 * temporary Docker Postgres container) before any test module imports
 * `lib/config.ts`, which throws eagerly if required vars are missing.
 */
import "dotenv/config";
