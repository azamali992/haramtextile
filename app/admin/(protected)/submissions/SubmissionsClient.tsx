"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";

export interface AdminContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface SubmissionsClientProps {
  initialSubmissions: AdminContactSubmission[];
}

function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

/**
 * Submissions table.
 *
 * Security note: `name`, `company`, and `message` below are untrusted
 * public input from the contact form. They are rendered exclusively via
 * JSX expressions (`{value}`), which React escapes automatically — never
 * via `dangerouslySetInnerHTML`. This is the one screen where these
 * fields are shown back to a privileged (admin) user, so this is the
 * critical stored-XSS choke point for this app.
 */
export function SubmissionsClient({ initialSubmissions }: SubmissionsClientProps) {
  const [submissions, setSubmissions] = useState<AdminContactSubmission[]>(initialSubmissions);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggleRead(submission: AdminContactSubmission) {
    setError(null);
    setTogglingId(submission.id);
    try {
      const updated = await adminFetch<AdminContactSubmission>(
        `/api/admin/submissions/${submission.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ isRead: !submission.isRead }),
        },
      );
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Failed to update submission.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 rounded border border-red-700 bg-red-50 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-cream-dark bg-cream-off">
        <table className="w-full text-left">
          <thead>
            <tr className="divide-x divide-cream-dark border-b border-cream-dark text-gray-warm">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-warm">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              submissions.map((submission) => {
                const isExpanded = expandedId === submission.id;
                return (
                  <tr
                    key={submission.id}
                    onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                    className={`cursor-pointer divide-x divide-cream-dark ${
                      submission.isRead ? "" : "font-medium"
                    }`}
                  >
                    <td className="px-4 py-3 align-top">{formatDate(submission.createdAt)}</td>
                    <td className="px-4 py-3 align-top">{submission.name}</td>
                    <td className="px-4 py-3 align-top">{submission.company ?? "—"}</td>
                    <td className="px-4 py-3 align-top">{submission.email}</td>
                    <td className="px-4 py-3 align-top">
                      {isExpanded ? (
                        <p className="whitespace-pre-wrap">{submission.message}</p>
                      ) : (
                        truncate(submission.message, 60)
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        disabled={togglingId === submission.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRead(submission).catch(() => {
                            setError("Failed to update submission.");
                          });
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          submission.isRead
                            ? "bg-cream-dark text-gray-warm"
                            : "bg-green-primary text-cream-off"
                        } disabled:opacity-60`}
                      >
                        {togglingId === submission.id
                          ? "Updating…"
                          : submission.isRead
                            ? "Read"
                            : "Unread"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
