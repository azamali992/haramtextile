import type { ReactNode } from "react";
import { getContactSettings } from "@/lib/services/contact-settings.service";
import { resolveContact } from "@/lib/site-content";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { UIProvider } from "@/components/layout/UIProvider";
import { LoaderProvider } from "@/components/layout/Loader";
import { ContactModal } from "@/components/layout/ContactModal";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  // Contact details are admin-editable; the footer renders the same phone/
  // email/address as the Contact page, so it reads from the same source.
  const contact = resolveContact(await getContactSettings());

  return (
    /*
     * Provider nesting order (outermost → innermost):
     * LenisProvider - initialises Lenis smooth-scroll and exposes start/stop
     * UIProvider    - manages contact modal + menu open/close booleans
     * LoaderProvider - shows the intro curtain; exposes `ready` via useLoader()
     *
     * ContactModal and MenuOverlay are rendered here (inside UIProvider) so
     * they portal to document.body and are present on every public page.
     */
    <LenisProvider>
      <UIProvider>
        <LoaderProvider>
          <SiteHeader />
          {children}
          <SiteFooter contact={contact} />
          <ContactModal />
          <MenuOverlay />
        </LoaderProvider>
      </UIProvider>
    </LenisProvider>
  );
}
