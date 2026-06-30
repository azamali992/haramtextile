import { buildFaqSchema, type FaqEntry } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";

interface FaqAccordionProps {
  faqs: FaqEntry[];
  /** Heading text for the section, e.g. "Frequently Asked Questions". */
  title?: string;
}

/**
 * CSS-only FAQ accordion using native `<details>`/`<summary>` — no
 * animation library (Phase 4 will add motion polish later). Also injects
 * the `FAQPage` JSON-LD script via `buildFaqSchema`.
 */
export function FaqAccordion({ faqs, title = "Frequently Asked Questions" }: FaqAccordionProps) {
  if (faqs.length === 0) return null;

  const schema = buildFaqSchema(faqs);

  return (
    <section aria-labelledby="faq-heading" className="bg-cream px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-heading" className="font-heading text-2xl text-brown-deep">
          {title}
        </h2>
        <dl className="mt-8 divide-y divide-cream-dark">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 40}>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-base font-medium text-brown-deep">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-gold-muted transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <dd className="mt-4 text-base text-gray-warm">{faq.answer}</dd>
              </details>
            </Reveal>
          ))}
        </dl>
      </div>
      <JsonLd data={schema} />
    </section>
  );
}
