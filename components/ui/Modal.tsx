"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Slide-over panel for layering an in-place quick-view on top of a real,
 * navigable page (used as a UX nice-to-have on the products grid — the
 * underlying `/products/[id]` route remains the real, crawlable detail
 * page so this is never the only way to reach product content).
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-brown-deep/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative h-full w-full max-w-md overflow-y-auto bg-cream-off p-6 shadow-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="mb-4 text-sm font-medium text-gray-warm hover:text-green-primary"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
