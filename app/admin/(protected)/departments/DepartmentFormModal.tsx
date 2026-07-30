"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import type { AdminDepartment } from "./DepartmentsClient";

interface DepartmentFormModalProps {
  initialValues?: AdminDepartment;
  onClose: () => void;
  onSaved: (department: AdminDepartment) => void;
}

/** Create/edit modal for a single department (just a name). */
export function DepartmentFormModal({
  initialValues,
  onClose,
  onSaved,
}: DepartmentFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [name, setName] = useState(initialValues?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setIsSubmitting(true);

    try {
      const department = await adminFetch<AdminDepartment>(
        isEditing ? `/api/admin/departments/${initialValues!.id}` : "/api/admin/departments",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({ name }),
        },
      );
      onSaved(department);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save department.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit department" : "Add department"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save department.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <div className="flex flex-col gap-1">
          <label htmlFor="dept-name" className="text-sm font-medium">
            Department name <span className="text-red-700">*</span>
          </label>
          <input
            id="dept-name"
            required
            maxLength={120}
            placeholder="Management"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
          />
        </div>

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
