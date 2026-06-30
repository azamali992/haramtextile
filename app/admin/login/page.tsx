"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Admin login page. Rendered outside the `(protected)` route group, so it
 * has no sidebar chrome and no session guard of its own — `middleware.ts`
 * explicitly allows this single path through unauthenticated.
 *
 * Security note: on failure we always show the same generic message
 * regardless of whether the email didn't exist or the password was wrong.
 * Distinguishing the two in the UI would let an attacker enumerate valid
 * admin email addresses.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream font-body text-sm text-brown-deep">
      <div className="w-full max-w-sm rounded border border-cream-dark bg-cream-off p-8">
        <h1 className="mb-1 font-heading text-xl text-green-primary">Haram Textile Admin</h1>
        <p className="mb-6 text-gray-warm">Sign in to manage site content.</p>

        <form
          onSubmit={(e) => {
            handleSubmit(e).catch(() => {
              setError("Invalid email or password.");
              setIsSubmitting(false);
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 text-brown-deep focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 text-brown-deep focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          {error && (
            <p role="alert" className="rounded border border-red-700 bg-red-50 px-3 py-2 text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
