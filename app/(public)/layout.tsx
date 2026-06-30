import type { ReactNode } from "react";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { UIProvider } from "@/components/layout/UIProvider";
import { LoaderProvider } from "@/components/layout/Loader";
import { ContactModal } from "@/components/layout/ContactModal";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    /*
     * Provider nesting order (outermost → innermost):
     * LenisProvider — initialises Lenis smooth-scroll and exposes start/stop
     * UIProvider    — manages contact modal + menu open/close booleans
     * LoaderProvider — shows the intro curtain; exposes `ready` via useLoader()
     *
     * ContactModal and MenuOverlay are rendered here (inside UIProvider) so
     * they portal to document.body and are present on every public page.
     */
    <LenisProvider>
      <UIProvider>
        <LoaderProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <ContactModal />
          <MenuOverlay />
        </LoaderProvider>
      </UIProvider>
    </LenisProvider>
  );
}
