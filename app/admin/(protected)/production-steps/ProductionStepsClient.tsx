"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { ProductionStepFormModal } from "./ProductionStepFormModal";

export interface AdminProductionStep {
  id: string;
  title: string;
  slug: string;
  description: string;
  statLabel: string | null;
  statValue: string | null;
  imageUrl: string;
  imagePublicId: string;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProductionStepsClientProps {
  initialProductionSteps: AdminProductionStep[];
}

function sortByOrder(steps: AdminProductionStep[]): AdminProductionStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

export function ProductionStepsClient({ initialProductionSteps }: ProductionStepsClientProps) {
  const [productionSteps, setProductionSteps] = useState<AdminProductionStep[]>(
    sortByOrder(initialProductionSteps),
  );
  const [editing, setEditing] = useState<AdminProductionStep | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/production-steps/${id}`, { method: "DELETE" });
      setProductionSteps((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete production step.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= productionSteps.length) {
      return;
    }

    const current = productionSteps[index];
    const neighbor = productionSteps[neighborIndex];

    setListError(null);
    setMovingId(current.id);
    try {
      const { first, second } = await adminFetch<{
        first: AdminProductionStep;
        second: AdminProductionStep;
      }>("/api/admin/production-steps/reorder", {
        method: "POST",
        body: JSON.stringify({ firstId: current.id, secondId: neighbor.id }),
      });

      setProductionSteps((prev) =>
        sortByOrder(
          prev.map((step) => {
            if (step.id === first.id) return first;
            if (step.id === second.id) return second;
            return step;
          }),
        ),
      );
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to reorder production step.");
    } finally {
      setMovingId(null);
    }
  }

  function handleSaved(productionStep: AdminProductionStep) {
    setProductionSteps((prev) => {
      const exists = prev.some((s) => s.id === productionStep.id);
      const next = exists
        ? prev.map((s) => (s.id === productionStep.id ? productionStep : s))
        : [...prev, productionStep];
      return sortByOrder(next);
    });
    setEditing(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">
          {productionSteps.length} production step{productionSteps.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add production step
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
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Stat</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {productionSteps.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-warm">
                  No production steps yet. Click &ldquo;Add production step&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              productionSteps.map((step, index) => (
                <tr key={step.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary thumbnail in an admin table */}
                    <img
                      src={step.imageUrl}
                      alt={step.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">{step.order}</td>
                  <td className="px-4 py-3">{step.title}</td>
                  <td className="px-4 py-3">
                    {step.statLabel && step.statValue ? `${step.statValue} ${step.statLabel}` : "-"}
                  </td>
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
                        disabled={index === productionSteps.length - 1 || movingId !== null}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(step)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(step.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editing) && (
        <ProductionStepFormModal
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
