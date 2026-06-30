"use client";

import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLenis } from "@/components/motion/LenisProvider";

// ─── Timing constants ─────────────────────────────────────────────────────────
const MIN_VISIBLE_MS = 1400;
const MAX_VISIBLE_MS = 2600;
const EXIT_MS = 850;
const PROGRESS_DELAY_MS = 120;
const PROGRESS_DURATION_MS = MIN_VISIBLE_MS - PROGRESS_DELAY_MS; // 1280 ms

// ─── Loader ready context ─────────────────────────────────────────────────────

interface LoaderContextValue {
  /** True once the loader has exited and hero content may animate in. */
  ready: boolean;
}

const LoaderContext = createContext<LoaderContextValue>({ ready: true });

/**
 * Returns `{ ready }` — when `false` the loader curtain is still showing;
 * when `true` the hero title and gated entrance animations may play.
 */
export function useLoader(): LoaderContextValue {
  return useContext(LoaderContext);
}

// ─── Inner curtain component ──────────────────────────────────────────────────

interface CurtainProps {
  onReady: () => void;
}

function Curtain({ onReady }: CurtainProps) {
  const { stop: lenisStop, start: lenisStart } = useLenis();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const curtainY = useMotionValue("0%");
  const progressScale = useMotionValue(0);
  const hasExited = useRef(false);

  const exit = useCallback(() => {
    if (hasExited.current) return;
    hasExited.current = true;

    onReady();
    lenisStart();

    if (prefersReducedMotion) {
      setVisible(false);
      return;
    }

    animate(curtainY, "-105%", {
      duration: EXIT_MS / 1000,
      ease: [0.65, 0, 0.35, 1], // easeInOutCubic
      onComplete: () => setVisible(false),
    });
  }, [onReady, lenisStart, prefersReducedMotion, curtainY]);

  useEffect(() => {
    // Stop scroll immediately.
    lenisStop();

    // Animate progress bar fill.
    const progressDelay = prefersReducedMotion ? 0 : PROGRESS_DELAY_MS;
    const progressDuration = prefersReducedMotion ? 0.1 : PROGRESS_DURATION_MS / 1000;

    const progressControls = animate(progressScale, 1, {
      delay: progressDelay / 1000,
      duration: progressDuration,
      ease: [0.65, 0, 0.35, 1],
    });

    // Determine minimum visible duration.
    const minMs = prefersReducedMotion ? 200 : MIN_VISIBLE_MS;
    const maxMs = prefersReducedMotion ? 300 : MAX_VISIBLE_MS;

    let minTimer: ReturnType<typeof setTimeout> | null = null;
    let maxTimer: ReturnType<typeof setTimeout> | null = null;
    let windowLoaded = false;
    let minElapsed = false;

    function tryExit() {
      if (windowLoaded && minElapsed) exit();
    }

    minTimer = setTimeout(() => {
      minElapsed = true;
      tryExit();
    }, minMs);

    if (document.readyState === "complete") {
      windowLoaded = true;
    } else {
      window.addEventListener("load", function onLoad() {
        windowLoaded = true;
        tryExit();
        window.removeEventListener("load", onLoad);
      });
    }

    // Safety: force exit after MAX_VISIBLE_MS no matter what.
    maxTimer = setTimeout(exit, maxMs);

    return () => {
      progressControls.stop();
      if (minTimer !== null) clearTimeout(minTimer);
      if (maxTimer !== null) clearTimeout(maxTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      style={{ y: curtainY }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[var(--brand-deep)]"
      aria-hidden="true"
    >
      {/* Wordmark */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <Image
          src="/images/brand/logo2.png"
          alt="Haram Textile"
          width={160}
          height={68}
          priority
          className="h-14 w-auto brightness-0 invert"
        />
      </motion.div>

      {/* Progress track */}
      <div
        className="relative overflow-hidden rounded-[var(--radius-pill)]"
        style={{
          width: "10rem",
          height: "1px",
          background: "rgba(253,250,246,0.2)",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--on-brand)",
            transformOrigin: "left center",
            scaleX: progressScale,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── LoaderProvider (exported) ────────────────────────────────────────────────

const SESSION_KEY = "ht_loader_played";

interface LoaderProviderProps {
  children: ReactNode;
}

/**
 * Mounts the intro loader curtain on the first hard-load of the session
 * (tracked via `sessionStorage`). On subsequent route changes within the
 * same session it renders children immediately with `ready: true`.
 *
 * Wrap the public layout contents with this provider so the `useLoader()`
 * hook is available to hero components that gate their entrance animations.
 *
 * @example
 * // app/(public)/layout.tsx
 * <LenisProvider>
 *   <UIProvider>
 *     <LoaderProvider>
 *       {children}
 *     </LoaderProvider>
 *   </UIProvider>
 * </LenisProvider>
 */
export function LoaderProvider({ children }: LoaderProviderProps) {
  // On the server, always treat as ready (no sessionStorage).
  const [showLoader, setShowLoader] = useState(false);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // Only show loader on first hard-load; not on internal navigations.
    const hasPlayed = sessionStorage.getItem(SESSION_KEY);
    if (!hasPlayed) {
      setReady(false);
      setShowLoader(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);

  return (
    <LoaderContext.Provider value={{ ready }}>
      {showLoader && <Curtain onReady={handleReady} />}
      {children}
    </LoaderContext.Provider>
  );
}
