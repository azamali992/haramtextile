"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Reveal3DProps {
  children: ReactNode;
  /** Stagger delay in ms, applied as a CSS transition-delay. */
  delay?: number;
  className?: string;
}

/**
 * Tilts and fades children into view once, the first time they enter the
 * viewport — a 3D variant of `Reveal` using `perspective`/`rotateX` instead
 * of a plain `translateY`. Defaults to fully visible — only hides via JS
 * after mount, so content is already at its final state if JS never runs
 * (no-JS, print, headless renderers).
 */
export function Reveal3D({ children, delay = 0, className = "" }: Reveal3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setReady(true);
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-3d ${ready && !visible ? "reveal-3d-hidden" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
