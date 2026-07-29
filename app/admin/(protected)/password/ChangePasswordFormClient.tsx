"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { FormFeedback, SuccessBanner } from "../../_components/FormFeedback";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const inputClass =
  "rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary";

/** Lets the signed-in admin change their own password (verifies the current one). */
export function ChangePasswordFormClient() {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof PasswordFormValues>(key: K, value: PasswordFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setSuccess(null);

    // Client-side guard for the confirmation field (the server only needs
    // current + new; matching is purely a UX check).
    if (values.newPassword !== values.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (values.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminFetch("/api/admin/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      setSuccess("Password changed. Use your new password next time you sign in.");
      setValues(EMPTY);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to change password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(e).catch(() => {
          setError("Failed to change password.");
          setIsSubmitting(false);
        });
      }}
      className="flex max-w-md flex-col gap-4 rounded border border-cream-dark bg-cream-off p-6"
    >
      <FormFeedback message={error} details={errorDetails} />
      <SuccessBanner message={success} />

      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current password <span className="text-red-700">*</span>
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => update("currentPassword", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New password <span className="text-red-700">*</span>
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => update("newPassword", e.target.value)}
          className={inputClass}
        />
        <span className="text-xs text-gray-warm">At least 8 characters.</span>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm new password <span className="text-red-700">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
