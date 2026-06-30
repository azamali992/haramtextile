"use client";

import { useState } from "react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
}

/**
 * A delete action that requires an explicit second click ("Confirm?")
 * before the destructive action fires, so a misclick can't immediately
 * delete a record.
 */
export function ConfirmDeleteButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Confirm?",
}: ConfirmDeleteButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="rounded px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          try {
            await onConfirm();
          } finally {
            setIsDeleting(false);
            setIsConfirming(false);
          }
        }}
        className="rounded bg-red-700 px-2 py-1 text-sm font-medium text-cream-off hover:bg-red-800 disabled:opacity-60"
      >
        {isDeleting ? "Deleting…" : confirmLabel}
      </button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => setIsConfirming(false)}
        className="rounded px-2 py-1 text-sm font-medium text-gray-warm hover:bg-cream-dark"
      >
        Cancel
      </button>
    </span>
  );
}
