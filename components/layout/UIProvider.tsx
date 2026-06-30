"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface UIContextValue {
  /** Whether the contact modal is currently open. */
  isContactOpen: boolean;
  /** Opens the contact modal. */
  openContact: () => void;
  /** Closes the contact modal. */
  closeContact: () => void;
  /** Whether the fullscreen menu overlay is currently open. */
  isMenuOpen: boolean;
  /** Opens the fullscreen menu overlay. */
  openMenu: () => void;
  /** Closes the fullscreen menu overlay. */
  closeMenu: () => void;
}

const UIContext = createContext<UIContextValue>({
  isContactOpen: false,
  openContact: () => undefined,
  closeContact: () => undefined,
  isMenuOpen: false,
  openMenu: () => undefined,
  closeMenu: () => undefined,
});

/**
 * Provides shared UI open/close state for the contact modal and fullscreen
 * menu overlay. Consume with `useUI()` from any public-site client component.
 *
 * @example
 * const { openContact, openMenu } = useUI();
 */
export function useUI(): UIContextValue {
  return useContext(UIContext);
}

interface UIProviderProps {
  children: ReactNode;
}

/**
 * Wraps the public layout with UI-state context. Renders `ContactModal` and
 * `MenuOverlay` at this level so they are always portaled regardless of which
 * page is active.
 *
 * Mount once in `app/(public)/layout.tsx`, *inside* `LenisProvider` so the
 * modal/menu can access `useLenis()` for scroll locking.
 */
export function UIProvider({ children }: UIProviderProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openContact = useCallback(() => setIsContactOpen(true), []);
  const closeContact = useCallback(() => setIsContactOpen(false), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <UIContext.Provider
      value={{ isContactOpen, openContact, closeContact, isMenuOpen, openMenu, closeMenu }}
    >
      {children}
    </UIContext.Provider>
  );
}
