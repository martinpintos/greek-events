import type { NextConfig } from "next";

// Dev (Turbopack HMR) needs eval + a websocket; production does not. Keeping the
// production policy tight while relaxing only for local dev avoids breaking HMR.
const isDev = process.env.NODE_ENV === "development";

// No nonces here on purpose: a nonce-based CSP would force every page to render
// dynamically and defeat ISR. We rely on 'unsafe-inline' for the inline JSON-LD
// and Next's bootstrap scripts, and lean on the other directives (frame-ancestors,
// object-src, base-uri, restricted origins) for defense-in-depth. Vercel Web
// Analytics is first-party (/_vercel/insights/*), so 'self' covers it.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Venue photos live on arbitrary third-party hosts (each venue's own site/CDN).
  // Routing them through next/image lets Vercel resize them to the rendered size,
  // serve AVIF/WebP, and CDN-cache the result instead of shipping multi-MB
  // full-res originals. Each venue host must be allow-listed here; add a new
  // entry whenever a venue with a new image host is onboarded.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.cavoparadiso.gr" },
      { protocol: "https", hostname: "supportmykonos.com" },
      { protocol: "https", hostname: "scorpios.com" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
