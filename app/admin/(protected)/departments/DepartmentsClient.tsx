"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { DepartmentFormModal } from "./DepartmentFormModal";

export interface AdminDepartment {
  id: string;
  name: string;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface DepartmentsClientProps {
  initialDepartments: AdminDepartment[];
}

function sortByOrder(items: AdminDepartment[]): AdminDepartment[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function DepartmentsClient({ initialDepartments }: DepartmentsClientProps) {
  const [departments, setDepartments] = useState<AdminDepartment[]>(
    sortByOrder(initialDepartments),
  );
  const [editing, setEditing] = useState<AdminDepartment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/departments/${id}`, { method: "DELETE" });
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete department.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= departments.length) return;

    const current = departments[index];
    const neighbor = departments[neighborIndex];

    setListError(null);
    setMovingId(current.id);
    try {
      const { first, second } = await adminFetch<{
        first: AdminDepartment;
        second: AdminDepartment;
      }>("/api/admin/departments/reorder", {
        method: "POST",
        body: JSON.stringify({ firstId: current.id, secondId: neighbor.id }),
      });

      setDepartments((prev) =>
        sortByOrder(
          prev.map((d) => {
            if (d.id === first.id) return first;
            if (d.id === second.id) return second;
            return d;
          }),
        ),
      );
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to reorder department.");
    } finally {
      setMovingId(null);
    }
  }

  function handleSaved(department: AdminDepartment) {
    setDepartments((prev) => {
      const exists = prev.some((d) => d.id === department.id);
      const next = exists
        ? prev.map((d) => (d.id === department.id ? department : d))
        : [...prev, department];
      return sortByOrder(next);
    });
    setEditing(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">
          {departments.length} department{departments.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add department
        </button>
      </div>

      {listError && (
        <p role="alert" className="mb-3 rounded border border-red-700 bg-red-50 px-3 py-2 text-red-800">
          {listError}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-cream-dark bg-cream-off">
        <table className="w-full text-left">
          <thead>
            <tr className="divide-x divide-cream-dark border-b border-cream-dark text-gray-warm">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-warm">
                  No departments yet. Click &ldquo;Add department&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              departments.map((department, index) => (
                <tr key={department.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">{department.order}</td>
                  <td className="px-4 py-3 font-medium">{department.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0 || movingId !== null}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === departments.length - 1 || movingId !== null}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(department)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(department.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editing) && (
        <DepartmentFormModal
          initialValues={editing ?? undefined}
          onClose={() => {
            setIsCreating(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
