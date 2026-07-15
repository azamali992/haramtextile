/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary-hosted uploads (products, certifications, hero, about, client logos).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // picsum.photos placeholders — only used where zero source imagery exists
      // (hero background, about image, client logos) per the presentation-layer
      // fallback strategy; see lib/product-image-fallback.ts for real-photo fallbacks.
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // Note: a Content-Security-Policy header is deliberately deferred. The app
  // renders inline <Script> blocks for Google Analytics (see app/layout.tsx)
  // and a strict CSP without proper nonce-based script wiring would break
  // those — shipping a half-correct CSP is worse than shipping none, so this
  // is left for a follow-up pass once nonce support is wired through.
  // /products was renamed to /catalog — permanent redirects so old
  // bookmarks/search-indexed links keep working instead of 404ing.
  async redirects() {
    return [
      { source: "/products", destination: "/catalog", permanent: true },
      { source: "/products/:id", destination: "/catalog/:id", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
