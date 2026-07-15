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

export interface VerticalCylinderItem {
  src: string;
  alt: string;
  href?: string;
}

interface VerticalCylinderCarouselProps {
  images: VerticalCylinderItem[];
  /** Degrees per second of autoplay rotation. @default 5 */
  speed?: number;
  /** Radius of the cylinder in pixels. @default 360 */
  radius?: number;
  /** Face width in pixels. @default 300 */
  faceWidth?: number;
  /** Face height in pixels. @default 380 */
  faceHeight?: number;
  className?: string;
}

/**
 * 3D rotating cylinder carousel — images arranged radially around an X-axis
 * drum, auto-rotating vertically and drag-to-spin. Pauses on hover/drag.
 * Reduced motion: renders a static vertical scroll column instead (same
 * content, no motion).
 */
export function VerticalCylinderCarousel({
  images,
  speed = 5,
  radius = 360,
  faceWidth = 300,
  faceHeight = 380,
  className = "",
}: VerticalCylinderCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const rotationX = useMotionValue(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const dragState = useRef({ startY: 0, startRotation: 0 });

  const anglePerItem = 360 / Math.max(images.length, 1);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion || isInteracting || images.length === 0) return;
    rotationX.set(rotationX.get() + (speed * delta) / 1000);
  });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    setIsInteracting(true);
    dragState.current = { startY: e.clientY, startRotation: rotationX.get() };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isInteracting) return;
    const dy = e.clientY - dragState.current.startY;
    rotationX.set(dragState.current.startRotation - dy * 0.25);
  }

  function onPointerUp() {
    setIsInteracting(false);
  }

  if (prefersReducedMotion) {
    return (
      <div
        className={`scroller-y flex max-h-[34rem] flex-col gap-5 overflow-y-auto ${className}`}
      >
        {images.map((item, i) => (
          <VerticalFace key={i} item={item} width={faceWidth} height={faceHeight} className="shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ perspective: "1400px" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      role="region"
      aria-label="Production process gallery"
    >
      <motion.div
        className="relative mx-auto"
        style={{
          width: faceWidth,
          height: faceHeight,
          transformStyle: "preserve-3d",
          rotateX: rotationX,
        }}
      >
        {images.map((item, i) => (
          <div
            key={i}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              transform: `rotateX(${-i * anglePerItem}deg) translateZ(${radius}px)`,
            }}
          >
            <VerticalFace item={item} width={faceWidth} height={faceHeight} draggable={false} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function VerticalFace({
  item,
  width,
  height,
  className = "",
  draggable,
}: {
  item: VerticalCylinderItem;
  width: number;
  height: number;
  className?: string;
  draggable?: boolean;
}) {
  const content = (
    <div
      className={`group relative overflow-hidden rounded-card border border-[var(--hairline)] bg-white shadow-card ${className}`}
      style={{ width, height }}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        draggable={draggable}
        sizes={`${width}px`}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
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
