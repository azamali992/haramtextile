"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface ClientLogoCarouselItem {
  id: string;
  imageUrl: string;
  altText: string;
}

interface ClientLogoCarouselProps {
  logos: ClientLogoCarouselItem[];
}

/**
 * CSS-only scrolling marquee of client logos. Renders the list twice
 * back-to-back inside one flex track so the `-50%` translateX loop is
 * seamless; the second copy is `aria-hidden` since it's a visual
 * duplicate, not new content.
 *
 * Defaults to the static (non-doubled) row on the server and only
 * switches to the doubled, animated track once mounted in a browser that
 * does *not* prefer reduced motion — mirroring `Reveal`'s defensive
 * mount-time guard. This avoids ever showing reduced-motion users a
 * half-duplicated, non-scrolling list.
 */
export function ClientLogoCarousel({ logos }: ClientLogoCarouselProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setShouldAnimate(!event.matches);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  if (logos.length === 0) {
    return null;
  }

  if (!shouldAnimate) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-10">
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="shrink-0 grayscale transition-[filter] duration-200 [@media(hover:hover)]:hover:grayscale-0"
          >
            <Image
              src={logo.imageUrl}
              alt={logo.altText}
              width={140}
              height={70}
              className="h-[70px] w-auto object-contain"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="logo-marquee-viewport">
      <div className="logo-marquee-track">
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            aria-hidden={index >= logos.length ? "true" : undefined}
            className="shrink-0 grayscale transition-[filter] duration-200 [@media(hover:hover)]:hover:grayscale-0"
          >
            <Image
              src={logo.imageUrl}
              alt={logo.altText}
              width={140}
              height={70}
              className="h-[70px] w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
