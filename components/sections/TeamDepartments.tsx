"use client";

import { useState } from "react";
import { Inview } from "@/components/motion/Inview";

export interface TeamDeptMember {
  name: string;
  role: string;
  email: string;
  phone?: string | null;
}

export interface TeamDept {
  id: string;
  name: string;
  members: TeamDeptMember[];
}

interface TeamDepartmentsProps {
  departments: TeamDept[];
}

/**
 * Department-tabbed team display: a horizontal row of department buttons; the
 * area below shows the selected department's members (name, role, email).
 * Content is admin-editable (Department + TeamMember tables).
 */
export function TeamDepartments({ departments }: TeamDepartmentsProps) {
  const [activeId, setActiveId] = useState(departments[0]?.id ?? "");

  if (departments.length === 0) return null;

  const active = departments.find((d) => d.id === activeId) ?? departments[0];

  return (
    <div className="mt-12">
      {/* Department buttons - horizontal row */}
      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Departments">
        {departments.map((dept) => {
          const isActive = dept.id === active.id;
          return (
            <button
              key={dept.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(dept.id)}
              className={`rounded-[var(--radius-pill)] px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                isActive
                  ? "bg-[var(--brand-deep)] text-[var(--on-brand)]"
                  : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)]"
              }`}
            >
              {dept.name}
            </button>
          );
        })}
      </div>

      {/* Members of the active department. Keyed by id so it re-animates on switch. */}
      <ul key={active.id} className="mt-8 border-t border-[var(--hairline)]" role="list">
        {active.members.length === 0 ? (
          <li className="py-8 font-body text-body text-[var(--ink-soft)]">
            No team members in this department yet.
          </li>
        ) : (
          active.members.map((member, i) => (
            <Inview
              key={`${member.email}-${i}`}
              delayIn={Math.min(i, 5) * 70}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 18 }}
              to={{ opacity: 1, y: 0 }}
            >
              <li className="grid grid-cols-1 items-baseline gap-2 border-b border-[var(--hairline)] py-6 sm:grid-cols-[minmax(12rem,1.6fr)_minmax(9rem,1.2fr)_minmax(9rem,1.2fr)_minmax(11rem,1.6fr)]">
                <p className="font-heading text-title font-semibold text-[var(--ink)]">
                  {member.name}
                </p>
                <p className="font-body text-body font-medium uppercase tracking-[0.14em] text-[var(--brand-strong)]">
                  {member.role}
                </p>
                {member.phone ? (
                  <a
                    href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}
                    className="font-body text-body-lg text-[var(--ink-soft)] transition-colors duration-150 hover:text-[var(--brand-strong)]"
                  >
                    {member.phone}
                  </a>
                ) : (
                  <span className="font-body text-body-lg text-[var(--ink-soft)]/50">—</span>
                )}
                <a
                  href={`mailto:${member.email}`}
                  className="font-body text-body-lg text-[var(--ink-soft)] transition-colors duration-150 hover:text-[var(--brand-strong)] sm:justify-self-end"
                >
                  {member.email}
                </a>
              </li>
            </Inview>
          ))
        )}
      </ul>
    </div>
  );
}
