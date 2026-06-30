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
 * Contact page visual + motion layer. Keeps the real ContactForm (which posts
 * to /api/contact) intact while adding the reference-style Eyebrow + RevealText
 * header, Inview reveals on the contact details dl, and restyled form inputs
 * (rounded-xl, hairline borders, gold focus ring).
 */
export function ContactPageClient({ contact, siteName }: ContactPageClientProps) {
  return (
    <div className="px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-[90rem]">
        {/* Page header */}
        <div className="mb-16">
          <Eyebrow tone="dark">Get in touch</Eyebrow>
          <RevealText
            as="h1"
            stagger={100}
            duration={1.0}
            className="mt-4 font-heading text-[3rem] leading-[0.95] tracking-tight text-[var(--ink)] sm:text-[4rem]"
          >
            Contact Us
          </RevealText>
          <Inview
            delayIn={200}
            stiffness={190}
            damping={26}
            from={{ opacity: 0, y: 16 }}
            to={{ opacity: 1, y: 0 }}
          >
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-[var(--ink-soft)]">
              Reach our export and marketing team directly. We typically respond
              within one to two business days.
            </p>
          </Inview>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: contact details */}
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
              <dl className="space-y-6">
                <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6">
                  <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                    Address
                  </dt>
                  <dd className="mt-2 font-body text-base text-[var(--ink)]">
                    {contact.address}
                  </dd>
                </div>

                <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6">
                  <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                    Phone
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                      className="font-body text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>

                <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6">
                  <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                    Email
                  </dt>
                  <dd className="mt-2">
                    <ul className="space-y-1">
                      {contact.emails.map((entry) => (
                        <li key={entry.email}>
                          <a
                            href={`mailto:${entry.email}`}
                            className="font-body text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
                          >
                            <span className="text-[var(--ink-soft)]">{entry.label}: </span>
                            {entry.email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>

                <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-6">
                  <dt className="font-body text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
                    Office Hours
                  </dt>
                  <dd className="mt-2 font-body text-base text-[var(--ink)]">
                    {contact.hours}
                  </dd>
                </div>
              </dl>
            </Inview>

            {/* Map link block */}
            <Inview
              delayIn={200}
              stiffness={190}
              damping={26}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <a
                href={contact.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${siteName}'s location on Google Maps`}
                className="block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card-lg)] bg-[var(--brand-deep)] transition-opacity hover:opacity-90"
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                  {/* Map pin icon */}
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[var(--brand-light)]"
                    aria-hidden="true"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="font-heading text-lg text-[var(--on-brand)]">
                    View Our Location
                  </span>
                  <span className="max-w-xs px-4 font-body text-sm text-[rgba(253,250,246,0.7)]">
                    {contact.address}
                  </span>
                  <span className="font-body text-sm text-[var(--brand-light)] underline">
                    Open in Google Maps
                  </span>
                </div>
              </a>
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
              <div className="rounded-[var(--radius-card-lg)] bg-[var(--surface)] p-8">
                <h2
                  id="contact-form-heading"
                  className="font-heading text-[1.75rem] leading-tight tracking-tight text-[var(--ink)]"
                >
                  Send an Inquiry
                </h2>
                <p className="mt-2 font-body text-sm text-[var(--ink-soft)]">
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
