"use client";

import { useState } from "react";
import { adminFetch, AdminApiError } from "@/lib/admin/api-client";
import { ConfirmDeleteButton } from "../../_components/ConfirmDeleteButton";
import { TeamMemberFormModal } from "./TeamMemberFormModal";

export interface AdminTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TeamClientProps {
  initialMembers: AdminTeamMember[];
}

function sortByOrder(members: AdminTeamMember[]): AdminTeamMember[] {
  return [...members].sort((a, b) => a.order - b.order);
}

export function TeamClient({ initialMembers }: TeamClientProps) {
  const [members, setMembers] = useState<AdminTeamMember[]>(sortByOrder(initialMembers));
  const [editing, setEditing] = useState<AdminTeamMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setListError(null);
    try {
      await adminFetch<void>(`/api/admin/team-members/${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to delete team member.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= members.length) {
      return;
    }

    const current = members[index];
    const neighbor = members[neighborIndex];

    setListError(null);
    setMovingId(current.id);
    try {
      const { first, second } = await adminFetch<{
        first: AdminTeamMember;
        second: AdminTeamMember;
      }>("/api/admin/team-members/reorder", {
        method: "POST",
        body: JSON.stringify({ firstId: current.id, secondId: neighbor.id }),
      });

      setMembers((prev) =>
        sortByOrder(
          prev.map((member) => {
            if (member.id === first.id) return first;
            if (member.id === second.id) return second;
            return member;
          }),
        ),
      );
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : "Failed to reorder team member.");
    } finally {
      setMovingId(null);
    }
  }

  function handleSaved(member: AdminTeamMember) {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      const next = exists ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member];
      return sortByOrder(next);
    });
    setEditing(null);
    setIsCreating(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-warm">
          {members.length} team member{members.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded bg-green-primary px-4 py-2 font-medium text-cream-off hover:bg-green-light"
        >
          Add team member
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
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-warm">
                  No team members yet. Click &ldquo;Add team member&rdquo; to create the first one.
                </td>
              </tr>
            ) : (
              members.map((member, index) => (
                <tr key={member.id} className="divide-x divide-cream-dark">
                  <td className="px-4 py-3">{member.order}</td>
                  <td className="px-4 py-3 font-medium">{member.name}</td>
                  <td className="px-4 py-3">{member.role}</td>
                  <td className="px-4 py-3">{member.email}</td>
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
                        disabled={index === members.length - 1 || movingId !== null}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(member)}
                        className="rounded px-2 py-1 font-medium text-green-primary hover:bg-cream-dark"
                      >
                        Edit
                      </button>
                      <ConfirmDeleteButton onConfirm={() => handleDelete(member.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(isCreating || editing) && (
        <TeamMemberFormModal
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
