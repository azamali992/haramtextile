"use client";

import { Inview } from "@/components/motion/Inview";

/**
 * The UN Sustainable Development Goals that Haram Textile's manufacturing most
 * directly supports. Colors are the official UN SDG palette. Copy is framed as
 * commitments/focus areas and anchored only to independently verifiable facts
 * (BSCI, OEKO-TEX Standard 100, ISO 9001, in-house dyeing, workforce size) —
 * no fabricated metrics. Replace/extend with audited data as it is confirmed.
 */
const GOALS = [
  {
    number: 6,
    title: "Clean Water & Sanitation",
    color: "#26BDE2",
    body: "Dyeing and finishing are the most water-intensive stages of knitwear production. We manage water use across our in-house dyeing and are committed to responsible effluent handling that protects the water sources around our Faisalabad facility.",
  },
  {
    number: 8,
    title: "Decent Work & Economic Growth",
    color: "#A21942",
    body: "Our BSCI-audited social compliance underpins safe, fair, and dignified working conditions for the 350+ people across our factory floor. Stable manufacturing work is one of the most direct contributions we make to our community.",
  },
  {
    number: 12,
    title: "Responsible Consumption & Production",
    color: "#BF8B2E",
    body: "Our OEKO-TEX Standard 100 certification means our fabrics are independently tested for harmful substances. We choose raw materials carefully and work to reduce offcut and finishing waste across knitting, cutting, and packing.",
  },
  {
    number: 3,
    title: "Good Health & Well-being",
    color: "#4C9F38",
    body: "Verified chemical safety and a well-maintained factory floor protect two groups at once: the workers who make our garments and the customers who ultimately wear them.",
  },
  {
    number: 5,
    title: "Gender Equality",
    color: "#FF3A21",
    body: "We are committed to equal opportunity, fair treatment, and a respectful workplace for every member of our workforce.",
  },
  {
    number: 13,
    title: "Climate Action",
    color: "#3F7E44",
    body: "Keeping every stage under one roof lets us run a tighter operation. We continue to work on the energy efficiency of our machines and processes to lower the footprint of what we manufacture.",
  },
] as const;

export function SustainabilityGoals() {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {GOALS.map((goal, i) => (
        <li key={goal.number} className="h-full">
          <Inview
            delayIn={Math.min(i * 70, 420)}
            stiffness={190}
            damping={26}
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
          >
            <article className="flex h-full flex-col rounded-card border border-[var(--hairline)] bg-[var(--surface)] p-7 transition-colors duration-200 hover:border-[var(--brand)]">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-md font-heading text-lg leading-none text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  {goal.number}
                </span>
                <span className="font-body text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Goal {goal.number}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-title-sm font-normal text-[var(--ink)]">
                {goal.title}
              </h3>
              <p className="mt-3 font-body text-caption leading-relaxed text-[var(--ink-soft)]">
                {goal.body}
              </p>
            </article>
          </Inview>
        </li>
      ))}
    </ul>
  );
}
