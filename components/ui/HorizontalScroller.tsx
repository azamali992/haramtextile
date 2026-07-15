"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowButton } from "@/components/ui/ArrowButton";

/** Left/right inset that aligns card 1 with the 90rem container while the
 *  row bleeds to the viewport edge on overflow. */
const EDGE_BLEED = "max(1.5rem, calc((100vw - 90rem) / 2))";

interface HorizontalScrollerProps {
  /** Accessible name for the carousel region. */
  ariaLabel: string;
  /** Slides - each child should be `shrink-0 snap-start` and set its own width. */
  children: ReactNode;
  /** Header content (SectionHeader etc.) rendered container-aligned, left of the arrows. */
  header?: ReactNode;
  /** Dark styling for arrows/progress/counter (use on green bands). @default false */
  dark?: boolean;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Gap utility for the track. @default "gap-5" */
  gapClassName?: string;
}

/**
 * Signature horizontal carousel: a native `overflow-x-auto` scroller (so
 * touch, trackpad and keyboard focus-scroll work for free) with pointer
 * drag-to-scroll + inertia, snap points, arrow controls, a gold progress
 * hairline and a `01 / 07` counter.
 *
 * - `data-lenis-prevent` keeps Lenis from swallowing wheel events; vertical
 *   wheel still scrolls the page (no scrolljack).
 * - Edge-bleed: the first card aligns with the 90rem container, the row
 *   bleeds off the right viewport edge.
 * - Reduced motion: arrow scrolls jump (`behavior: "auto"`), no drag inertia.
 */
export function HorizontalScroller({
  ariaLabel,
  children,
  header,
  dark = false,
  className = "",
  gapClassName = "gap-5",
}: HorizontalScrollerProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [index, setIndex] = useState(0);

  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, { stiffness: 220, damping: 34 });

  // ── Scroll state sync ───────────────────────────────────────────────────
  const syncScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    progress.set(max > 0 ? el.scrollLeft / max : 0);
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft < max - 2);
    const stride = getStride(el);
    if (stride > 0) {
      setIndex(Math.min(count - 1, Math.round(el.scrollLeft / stride)));
    }
  }, [count, progress]);

  useEffect(() => {
    syncScrollState();
    const onResize = () => syncScrollState();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncScrollState]);

  /** Distance between the starts of two adjacent slides. */
  function getStride(el: HTMLDivElement): number {
    const items = el.children;
    if (items.length >= 2) {
      const a = items[0] as HTMLElement;
      const b = items[1] as HTMLElement;
      return b.offsetLeft - a.offsetLeft;
    }
    return el.clientWidth * 0.8;
  }

  const scrollByStride = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * getStride(el),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // ── Pointer drag-to-scroll (mouse/pen; touch pans natively) ─────────────
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = scrollerRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) {
      el.scrollLeft = d.startScrollLeft - dx;
      const now = performance.now();
      const dt = now - d.lastT;
      if (dt > 0) {
        d.velocity = ((e.clientX - d.lastX) / dt) * 1000; // px/s
        d.lastX = e.clientX;
        d.lastT = now;
      }
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = scrollerRef.current;
    if (!d.active || !el) return;
    d.active = false;
    if (d.moved) {
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (!prefersReducedMotion && Math.abs(d.velocity) > 120) {
        const max = el.scrollWidth - el.clientWidth;
        const target = Math.max(0, Math.min(max, el.scrollLeft - d.velocity * 0.25));
        animate(el.scrollLeft, target, {
          type: "spring",
          stiffness: 120,
          damping: 28,
          velocity: -d.velocity,
          onUpdate: (v) => {
            el.scrollLeft = v;
          },
        });
      }
    }
  };

  /** Suppress the click that follows a drag so card links don't fire. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const counterColor = dark ? "text-on-brand/60" : "text-ink-soft";
  const trackColor = dark ? "bg-on-brand/20" : "bg-hairline";

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={className}
    >
      {/* Header row - container-aligned */}
      {(header || count > 1) && (
        <div
          className="mx-auto flex max-w-[90rem] flex-col gap-8 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10"
        >
          <div className="min-w-0">{header}</div>
          {count > 1 && (
            <div className="flex shrink-0 items-center gap-3 pb-1">
              <ArrowButton
                prev
                variant={dark ? "outlineLight" : "outline"}
                aria-label="Previous"
                aria-disabled={!canPrev}
                className={canPrev ? "" : "pointer-events-none opacity-40"}
                onClick={() => scrollByStride(-1)}
              />
              <ArrowButton
                variant={dark ? "outlineLight" : "outline"}
                aria-label="Next"
                aria-disabled={!canNext}
                className={canNext ? "" : "pointer-events-none opacity-40"}
                onClick={() => scrollByStride(1)}
              />
            </div>
          )}
        </div>
      )}

      {/* Scroller track - edge-bleed */}
      <div
        ref={scrollerRef}
        data-lenis-prevent
        className={`scroller-x mt-12 flex snap-x snap-proximity overflow-x-auto ${gapClassName} cursor-grab active:cursor-grabbing`}
        style={{
          paddingInlineStart: EDGE_BLEED,
          paddingInlineEnd: EDGE_BLEED,
          scrollPaddingInlineStart: EDGE_BLEED,
        }}
        onScroll={syncScrollState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>

      {/* Progress hairline + counter - container-aligned */}
      {count > 1 && (
        <div className="mx-auto mt-10 flex max-w-[90rem] items-center gap-6 px-6 sm:px-10">
          <div className={`relative h-px flex-1 overflow-hidden ${trackColor}`}>
            <motion.div
              className="absolute inset-0 origin-left bg-[var(--brand)]"
              style={{ scaleX: progressSpring }}
            />
          </div>
          <p
            className={`shrink-0 font-heading text-caption tabular-nums ${counterColor}`}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
        </div>
      )}
    </section>
  );
}
