"use client";

import { RevealText } from "@/components/motion/RevealText";
import { Inview } from "@/components/motion/Inview";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/ui/ContactForm";
import type { SiteContentEmail } from "@/lib/site-content";

interface ContactInfo {
  phone: string;
  emails: SiteContentEmail[];
  address: string;
  mapLink: string;
  hours: string;
}

interface ContactPageClientProps {
  contact: ContactInfo;
  siteName: string;
}

/**
 * Contact page: editorial header, then a two-column layout - one hairline-
 * divided details panel (address / phone / email / hours / map link) beside
 * the shared ContactForm. No stacked card boxes, no fake map block.
 */
export function ContactPageClient({ contact, siteName }: ContactPageClientProps) {
  const detailRow =
    "grid grid-cols-1 gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6";
  const dtClass =
    "font-body text-eyebrow font-medium uppercase text-[var(--ink-soft)]";

  return (
    <div className="px-6 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-[90rem]">
        {/* Page header */}
        <div className="mb-16">
          <Eyebrow tone="dark">Get in touch</Eyebrow>
          <div className="mt-4">
            <RevealText
              as="h1"
              stagger={100}
              duration={1.0}
              className="font-heading font-normal text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)] sm:text-display-lg"
              accentLastWord="italic text-[var(--brand-strong)]"
            >
              Start the conversation
            </RevealText>
          </div>
          <Inview
            delayIn={200}
            stiffness={190}
            damping={26}
            from={{ opacity: 0, y: 16 }}
            to={{ opacity: 1, y: 0 }}
          >
            <p className="mt-6 max-w-xl font-body text-body-lg leading-relaxed text-[var(--ink-soft)]">
              Reach our export and marketing team directly. We typically respond
              within one to two business days.
            </p>
          </Inview>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left: contact details - one hairline-divided panel */}
          <section aria-labelledby="contact-details-heading">
            <h2 id="contact-details-heading" className="sr-only">
              Contact Details
            </h2>

            <Inview
              delayIn={100}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
            >
              <dl className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                <div className={detailRow}>
                  <dt className={dtClass}>Address</dt>
                  <dd className="font-body text-body text-[var(--ink)]">
                    {contact.address}
                  </dd>
                </div>

                <div className={detailRow}>
                  <dt className={dtClass}>Phone</dt>
                  <dd>
                    <a
                      href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                      className="font-body text-body text-[var(--ink)] transition-colors hover:text-[var(--brand-strong)]"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>

                <div className={detailRow}>
                  <dt className={dtClass}>Email</dt>
                  <dd>
                    <ul className="space-y-1.5">
                      {contact.emails.map((entry) => (
                        <li key={entry.email}>
                          <a
                            href={`mailto:${entry.email}`}
                            className="font-body text-body text-[var(--ink)] transition-colors hover:text-[var(--brand-strong)]"
                          >
                            <span className="text-[var(--ink-soft)]">{entry.label}: </span>
                            {entry.email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>

                <div className={detailRow}>
                  <dt className={dtClass}>Office hours</dt>
                  <dd className="font-body text-body text-[var(--ink)]">
                    {contact.hours}
                  </dd>
                </div>

                <div className={detailRow}>
                  <dt className={dtClass}>Location</dt>
                  <dd>
                    <a
                      href={contact.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${siteName}'s location on Google Maps`}
                      className="group inline-flex items-center gap-2 font-body text-body text-[var(--brand-strong)] transition-colors hover:text-[var(--brand-deep)]"
                    >
                      {/* Map pin icon */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="underline underline-offset-4">
                        Open in Google Maps
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </a>
                  </dd>
                </div>
              </dl>
            </Inview>
          </section>

          {/* Right: contact form */}
          <section aria-labelledby="contact-form-heading">
            <Inview
              delayIn={150}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-card-lg bg-[var(--surface)] p-8 sm:p-10">
                <h2
                  id="contact-form-heading"
                  className="font-heading text-title font-normal leading-tight tracking-tight text-[var(--ink)]"
                >
                  Send an inquiry
                </h2>
                <p className="mt-2 font-body text-caption text-[var(--ink-soft)]">
                  Tell us about your order requirements and we will respond promptly.
                </p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </Inview>
          </section>
        </div>
      </div>
    </div>
  );
}
