"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { StatFormModal } from "./StatFormModal";

export interface AdminStat {
  id: string;
  label: string;
  value: number;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface StatsClientProps {
  initialStats: AdminStat[];
}

function sortByOrder(stats: AdminStat[]): AdminStat[] {
  return [...stats].sort((a, b) => a.order - b.order);
}

export function StatsClient({ initialStats }: StatsClientProps) {
  const [stats, setStats] = useState<AdminStat[]>(sortByOrder(initialStats));
  const [editing, setEditing] = useState<AdminStat | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/stats/${id}`, { method: "DELETE" });
      setStats((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete stat.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= stats.length) {
      return;
    }

    const current = stats[index];
    const neighbor = stats[neighborIndex];

    setListError(null);
    setMovingId(current.id);
    try {
      const { first, second } = await adminFetch<{ first: AdminStat; second: AdminStat }>(
        "/api/admin/stats/reorder",
        {
          method: "POST",
          body: JSON.stringify({ firstId: current.id, secondId: neighbor.id }),
        },
      );

      setStats((prev) =>
        sortByOrder(
          prev.map((stat) => {
            if (stat.id === first.id) return first;
            if (stat.id === second.id) return second;
            return stat;
          }),
        ),
      );
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to reorder stat.");
    } finally {
      setMovingId(null);
    }
  }

  function handleSaved(stat: AdminStat) {
    setStats((prev) => {
      const exists = prev.some((s) => s.id === stat.id);
      const next = exists ? prev.map((s) => (s.id === stat.id ? stat : s)) : [...prev, stat];
      return sortByOrder(next);
    });
    setEditing(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">
          {stats.length} stat{stats.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add stat
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
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {stats.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-warm">
                  No stats yet. Click &ldquo;Add stat&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              stats.map((stat, index) => (
                <tr key={stat.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">{stat.order}</td>
                  <td className="px-4 py-3 font-medium">{stat.value.toLocaleString()}</td>
                  <td className="px-4 py-3">{stat.label}</td>
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
                        disabled={index === stats.length - 1 || movingId !== null}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(stat)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(stat.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editing) && (
        <StatFormModal
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
