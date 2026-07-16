"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import type { AdminStat } from "./StatsClient";

interface StatFormValues {
  label: string;
  value: string;
}

interface StatFormModalProps {
  initialValues?: AdminStat;
  onClose: () => void;
  onSaved: (stat: AdminStat) => void;
}

function toFormValues(stat?: AdminStat): StatFormValues {
  return {
    label: stat?.label ?? "",
    value: stat?.value !== undefined ? String(stat.value) : "",
  };
}

/** Create/edit modal form for a single stat. */
export function StatFormModal({ initialValues, onClose, onSaved }: StatFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<StatFormValues>(toFormValues(initialValues));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  function update<K extends keyof StatFormValues>(key: K, value: StatFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);

    const numericValue = Number(values.value);
    if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue) || numericValue < 0) {
      setError("Value must be a whole number (0 or greater).");
      return;
    }

    setIsSubmitting(true);

    const payload = { label: values.label, value: numericValue };

    try {
      const stat = await adminFetch<AdminStat>(
        isEditing ? `/api/admin/stats/${initialValues!.id}` : "/api/admin/stats",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(stat);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save stat.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit stat" : "Add stat"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save stat.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="label" className="text-sm font-medium">
              Label <span className="text-red-700">*</span>
            </label>
            <input
              id="label"
              required
              maxLength={120}
              placeholder="Specialized machines"
              value={values.label}
              onChange={(e) => update("label", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="value" className="text-sm font-medium">
              Value <span className="text-red-700">*</span>
            </label>
            <input
              id="value"
              required
              type="number"
              min={0}
              step={1}
              placeholder="220"
              value={values.value}
              onChange={(e) => update("value", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
            <p className="text-xs text-gray-warm">
              A whole number. The site abbreviates large values automatically (e.g. 30000 → 30K+).
            </p>
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-cream-dark pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 font-medium text-gray-warm hover:bg-cream-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
