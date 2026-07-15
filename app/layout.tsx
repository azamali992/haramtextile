import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { config } from "@/lib/config";
import { buildMetadata, buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import { getSeoSettings } from "@/lib/services/seo-settings.service";
import { siteContent } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSeoSettings().catch(() => null);

  return buildMetadata(
    {},
    {
      siteTitleSuffix: seoSettings?.siteTitleSuffix,
      defaultMetaDescription: seoSettings?.defaultMetaDescription ?? siteContent.home.aboutShort,
      siteUrl: config.NEXT_PUBLIC_SITE_URL,
    },
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoSettings = await getSeoSettings().catch(() => null);

  const organizationSchema = buildOrganizationSchema({
    name: siteContent.site.name,
    description: siteContent.home.aboutShort,
    url: config.NEXT_PUBLIC_SITE_URL,
    sameAs: seoSettings?.organizationSameAs,
    phone: siteContent.contact.phone,
    email: siteContent.contact.emails[0]?.email,
    address: siteContent.contact.address,
  });

  const webSiteSchema = buildWebSiteSchema({
    name: siteContent.site.name,
    url: config.NEXT_PUBLIC_SITE_URL,
    searchPath: "/catalog?search={query}",
  });

  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      {/*
        Adaptive rem-grid scale-UP bootstrap (runs before paint to avoid FOUC).
        Below 1920px the CSS media queries handle scaling via vw units.
        Above 1920px this script computes an enlarged font-size and writes it
        inline to <html>. The string is fully static - no user-controlled input.
        FONT_BASE=16, BASE_W=1920, COEF=0.6666
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h=document.documentElement,F=16,B=1920,C=0.6666;function u(){var r=((B-window.innerWidth)/B)*100*C,s=F-(F*r)/100;if(s>F){h.style.fontSize=s+"px";}else{h.style.removeProperty("font-size");}}u();window.addEventListener("resize",u);})();`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
        {config.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${config.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
