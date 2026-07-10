import { buildFaqSchema, type FaqEntry } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

interface FaqAccordionProps {
  faqs: FaqEntry[];
  /** Heading text for the section, e.g. "Frequently Asked Questions". */
  title?: string;
}

/**
 * CSS-only FAQ accordion using native `<details>`/`<summary>`, styled as
 * hairline editorial rows. Also injects the `FAQPage` JSON-LD script via
 * `buildFaqSchema`.
 */
export function FaqAccordion({ faqs, title = "Frequently Asked Questions" }: FaqAccordionProps) {
  if (faqs.length === 0) return null;

  const schema = buildFaqSchema(faqs);

  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-[var(--background)] px-6 py-24 sm:px-10"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="font-heading text-display font-normal text-[var(--ink)]"
        >
          {title}
        </h2>
        <dl className="mt-12 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-title-sm font-normal text-[var(--ink)] transition-colors duration-150 hover:text-[var(--brand-strong)]">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-pill border border-[var(--hairline)] text-[var(--brand)] transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dd className="mt-4 max-w-2xl font-body text-body leading-relaxed text-[var(--ink-soft)]">
                {faq.answer}
              </dd>
            </details>
          ))}
        </dl>
      </div>
      <JsonLd data={schema} />
    </section>
  );
}
