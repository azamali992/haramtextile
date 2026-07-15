"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";
import { type ElementType } from "react";

// easeOutExpo cubic-bezier approximation
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealTextProps {
  /** The text string to reveal word-by-word. */
  children: string;
  /**
   * The HTML element to render the outer wrapper as.
   * @default "p"
   */
  as?: ElementType;
  /**
   * Stagger delay between each word in milliseconds.
   * @default 140
   */
  stagger?: number;
  /**
   * Duration of each word's animation in seconds.
   * @default 1.1
   */
  duration?: number;
  /**
   * When true the animation only plays once the `ready` prop flips to true.
   * Useful for gating hero text behind the loader.
   * @default false
   */
  gated?: boolean;
  /**
   * Controls whether the gated animation is allowed to play.
   * Has no effect when `gated` is false.
   */
  ready?: boolean;
  /**
   * Re-fires the animation whenever this key changes (e.g. carousel slide index).
   */
  animationKey?: string | number;
  /** Extra classes forwarded to the outer element. */
  className?: string;
  /** When true, applies `white-space: nowrap` to each word clip box. */
  noWrap?: boolean;
  /**
   * Classes applied to the final word only - the editorial accent
   * (e.g. `"italic text-[var(--brand-light)]"`).
   */
  accentLastWord?: string;
  /** Additional Framer Motion props forwarded to the outer container. */
  motionProps?: Omit<HTMLMotionProps<"div">, "children" | "variants" | "initial" | "animate">;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: {
      staggerChildren: stagger / 1000,
    },
  }),
};

const wordVariants: Variants = {
  hidden: { y: "115%", opacity: 0 },
  visible: (duration: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration,
      ease: EASE_OUT_EXPO,
    },
  }),
};

/**
 * Reveals text word-by-word using a clip-mask slide-up animation powered by
 * Framer Motion. Each word is wrapped in an `overflow-hidden` span so the
 * animation is clipped (no descender cut - a `padding-bottom: 0.14em` guard
 * is applied to each clip box).
 *
 * Respects `prefers-reduced-motion` - when the user has opted out of motion
 * the text renders immediately at full opacity.
 *
 * @example
 * // Hero title, gated on loader ready
 * <RevealText as="h1" stagger={140} gated ready={loaderReady} className="text-white">
 *   Crafted for Global Markets
 * </RevealText>
 */
export function RevealText({
  children,
  as: Tag = "p",
  stagger = 140,
  duration = 1.1,
  gated = false,
  ready = false,
  animationKey,
  className = "",
  noWrap = false,
  accentLastWord,
  motionProps,
}: RevealTextProps) {
  // Reduced motion must NOT change the rendered structure (the server always
  // renders the animated markup, so a structural branch breaks hydration).
  // Instead the same variants run with zero duration/stagger - content
  // appears immediately after hydration without motion.
  const prefersReducedMotion = useReducedMotion();

  const words = children.split(" ").filter(Boolean);

  const shouldAnimate = prefersReducedMotion || (gated ? ready : true);
  const animateState = shouldAnimate ? "visible" : "hidden";
  const effectiveStagger = prefersReducedMotion ? 0 : stagger;
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  // We need a motion-capable element. Use motion.div by default and render Tag
  // as the semantic element separately only when it's truly needed - but the
  // simplest idiomatic approach is to render a motion wrapper matching the tag.
  // For h1/h2/p/span we use the motion[tag] factory.
  const MotionTag = motion[Tag as keyof typeof motion] as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & {
      variants?: Variants;
      initial?: string;
      animate?: string;
      custom?: unknown;
    }
  >;

  return (
    <MotionTag
      key={animationKey}
      className={`inline ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={animateState}
      custom={effectiveStagger}
      {...(motionProps as React.HTMLAttributes<HTMLElement>)}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            paddingBottom: "0.14em",
            marginBottom: "-0.14em",
            verticalAlign: "bottom",
            whiteSpace: noWrap ? "nowrap" : undefined,
          }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            className={
              accentLastWord && i === words.length - 1 ? accentLastWord : undefined
            }
            variants={wordVariants}
            custom={effectiveDuration}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}
