"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface LenisContextValue {
  /** Pause smooth scrolling (e.g. while a modal or the loader is open). */
  stop: () => void;
  /** Resume smooth scrolling. */
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  stop: () => undefined,
  start: () => undefined,
});

/**
 * Returns the Lenis scroll-lock helpers exposed by `LenisProvider`.
 * Call `stop()` when opening a modal/overlay and `start()` when closing.
 */
export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}

interface LenisProviderProps {
  children: ReactNode;
}

/**
 * Initialises Lenis smooth-scroll once (client-side only), drives it with a
 * rAF loop, and exposes `start()`/`stop()` via context so the loader, contact
 * modal, and menu overlay can scroll-lock without reaching for the Lenis
 * instance directly.
 *
 * Also toggles `html { overflow: hidden }` on lock so native scroll is
 * suppressed alongside the Lenis stop, and resets scroll position to 0 on
 * first mount (matching the reference spec requirement).
 */
export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.style.removeProperty("overflow");
  }, []);

  useEffect(() => {
    // Reset scroll to top on initial mount (before Lenis takes over).
    window.scrollTo(0, 0);

    const lenis = new Lenis({ smoothWheel: true });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={{ stop, start }}>
      {children}
    </LenisContext.Provider>
  );
}
