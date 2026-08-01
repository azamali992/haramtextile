"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { Modal } from "../../_components/Modal";
import { FormFeedback } from "../../_components/FormFeedback";
import type { AdminTeamMember, DepartmentOption } from "./TeamClient";

interface TeamMemberFormValues {
  name: string;
  role: string;
  email: string;
  phone: string;
  departmentId: string;
  order: string;
}

interface TeamMemberFormModalProps {
  initialValues?: AdminTeamMember;
  departments: DepartmentOption[];
  onClose: () => void;
  onSaved: (member: AdminTeamMember) => void;
}

function toFormValues(member?: AdminTeamMember): TeamMemberFormValues {
  return {
    name: member?.name ?? "",
    role: member?.role ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    departmentId: member?.departmentId ?? "",
    order: String(member?.order ?? 0),
  };
}

/** Create/edit modal form for a single team member. */
export function TeamMemberFormModal({
  initialValues,
  departments,
  onClose,
  onSaved,
}: TeamMemberFormModalProps) {
  const isEditing = Boolean(initialValues);
  const [values, setValues] = useState<TeamMemberFormValues>(toFormValues(initialValues));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<unknown>(undefined);

  function update<K extends keyof TeamMemberFormValues>(key: K, value: TeamMemberFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setErrorDetails(undefined);
    setIsSubmitting(true);

    const payload = {
      name: values.name,
      role: values.role,
      email: values.email,
      phone: values.phone || null,
      departmentId: values.departmentId || null,
      order: Number(values.order) || 0,
    };

    try {
      const member = await adminFetch<AdminTeamMember>(
        isEditing ? `/api/admin/team-members/${initialValues!.id}` : "/api/admin/team-members",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(member);
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setErrorDetails(err.details);
      } else {
        setError("Failed to save team member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? "Edit team member" : "Add team member"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(() => {
            setError("Failed to save team member.");
            setIsSubmitting(false);
          });
        }}
        className="flex flex-col gap-5"
      >
        <FormFeedback message={error} details={errorDetails} />

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-700">*</span>
            </label>
            <input
              id="name"
              required
              maxLength={200}
              placeholder="Mr. Rashid Mehmood"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-red-700">*</span>
            </label>
            <input
              id="role"
              required
              maxLength={200}
              placeholder="CEO"
              value={values.role}
              onChange={(e) => update("role", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-red-700">*</span>
            </label>
            <input
              id="email"
              required
              type="email"
              maxLength={200}
              placeholder="name@haramtextile.com"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <input
              id="phone"
              maxLength={30}
              placeholder="+92 300 1234567"
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="departmentId" className="text-sm font-medium">
              Department
            </label>
            <select
              id="departmentId"
              value={values.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
              className="rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            >
              <option value="">— Unassigned —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {departments.length === 0 && (
              <span className="text-xs text-gray-warm">
                No departments yet — create them on the Departments page first.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="order" className="text-sm font-medium">
              Order
            </label>
            <input
              id="order"
              type="number"
              step={1}
              value={values.order}
              onChange={(e) => update("order", e.target.value)}
              className="w-24 rounded border border-cream-dark bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
            <p className="text-xs text-gray-warm">
              Position in the list (0 = first). Lower numbers show first.
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
