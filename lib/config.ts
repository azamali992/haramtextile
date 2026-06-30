/**
 * Centralized, validated access to environment variables.
 *
 * Import `config` from this module instead of reading `process.env`
 * directly elsewhere in the codebase. On startup (first import), this
 * module checks that every required variable is present and throws a
 * single, clear error listing all of the missing ones if not.
 *
 * `NEXT_PUBLIC_GA_ID` is intentionally optional — analytics is opt-in.
 */

interface RequiredEnvVars {
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_TO: string;
  NEXT_PUBLIC_SITE_URL: string;
}

interface OptionalEnvVars {
  NEXT_PUBLIC_GA_ID?: string;
}

type EnvVars = RequiredEnvVars & OptionalEnvVars;

const REQUIRED_KEYS: (keyof RequiredEnvVars)[] = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_TO",
  "NEXT_PUBLIC_SITE_URL",
];

function validateEnv(): EnvVars {
  const missing: string[] = [];

  for (const key of REQUIRED_KEYS) {
    if (!process.env[key] || process.env[key]?.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill in real values before starting the app.",
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    EMAIL_HOST: process.env.EMAIL_HOST!,
    EMAIL_PORT: process.env.EMAIL_PORT!,
    EMAIL_USER: process.env.EMAIL_USER!,
    EMAIL_PASS: process.env.EMAIL_PASS!,
    EMAIL_TO: process.env.EMAIL_TO!,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  };
}

export const config = validateEnv();
