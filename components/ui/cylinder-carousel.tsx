"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useRef, useState } from "react";

export interface CylinderCarouselItem {
  src: string;
  alt: string;
  /** Optional caption shown under the image on the active/hovered face. */
  caption?: string;
  /** Optional link - wraps the face in a `<Link>` when provided. */
  href?: string;
}

interface CylinderCarouselProps {
  images: CylinderCarouselItem[];
  /** Degrees per second of autoplay rotation. @default 6 */
  speed?: number;
  /** Radius of the cylinder in pixels. @default 340 */
  radius?: number;
  /** Face width in pixels. @default 200 */
  faceWidth?: number;
  /** CSS perspective distance in pixels - larger flattens the curve so side
   * faces reach further toward the edges before receding. @default 1400 */
  perspective?: number;
  className?: string;
}

/**
 * 3D rotating cylinder carousel - images arranged radially around a Y-axis
 * cylinder, auto-rotating and drag-to-spin. Pauses on hover/drag/focus.
 *
 * Reduced motion: renders a static horizontal scroll row instead of the 3D
 * rotation (same content, no motion).
 *
 * @example
 * <CylinderCarousel images={[{ src, alt, href: "/catalog/123" }]} />
 */
export function CylinderCarousel({
  images,
  speed = 6,
  radius = 340,
  faceWidth = 200,
  perspective = 1400,
  className = "",
}: CylinderCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const rotationY = useMotionValue(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const dragState = useRef({ startX: 0, startRotation: 0 });

  const anglePerItem = 360 / Math.max(images.length, 1);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || isInteracting || images.length === 0) return;
    rotationY.set(rotationY.get() - (speed * delta) / 1000);
  });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    setIsInteracting(true);
    dragState.current = { startX: e.clientX, startRotation: rotationY.get() };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isInteracting) return;
    const dx = e.clientX - dragState.current.startX;
    rotationY.set(dragState.current.startRotation + dx * 0.25);
  }

  function onPointerUp() {
    setIsInteracting(false);
  }

  if (prefersReducedMotion) {
    return (
      <div
        className={`scroller-x flex snap-x snap-proximity gap-5 overflow-x-auto px-6 sm:px-10 ${className}`}
      >
        {images.map((item, i) => (
          <CarouselFace key={i} item={item} width={faceWidth} className="shrink-0 snap-start" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ perspective: `${perspective}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      role="region"
      aria-label="Product showcase carousel"
    >
      <motion.div
        className="relative mx-auto"
        style={{
          width: faceWidth,
          height: faceWidth * 1.25,
          transformStyle: "preserve-3d",
          rotateY: rotationY,
        }}
      >
        {images.map((item, i) => (
          <div
            key={i}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              transform: `rotateY(${i * anglePerItem}deg) translateZ(${radius}px)`,
            }}
          >
            <CarouselFace item={item} width={faceWidth} draggable={false} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CarouselFace({
  item,
  width,
  className = "",
  draggable,
}: {
  item: CylinderCarouselItem;
  width: number;
  className?: string;
  draggable?: boolean;
}) {
  const content = (
    <div
      className={`group relative overflow-hidden rounded-card border border-[var(--hairline)] bg-white shadow-card ${className}`}
      style={{ width, aspectRatio: "4 / 5" }}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        draggable={draggable}
        sizes={`${width}px`}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {item.caption && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim/85 via-scrim/30 to-transparent px-4 pb-4 pt-10"
          aria-hidden="true"
        >
          <p className="font-heading text-title-sm font-normal text-[var(--on-brand)]">
            {item.caption}
          </p>
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
        {content}
      </Link>
    );
  }

  return content;
}
