import type { NextConfig } from "next";

/**
 * Content Security Policy, sent as REPORT-ONLY for now: browsers log violations to the
 * console but block nothing. Once a deploy shows no violations, rename the header to
 * `Content-Security-Policy` to enforce it.
 *
 * - 'unsafe-inline' scripts: Next inlines its hydration data; nonces would force every
 *   page to render dynamically instead of being prerendered.
 * - Fonts (next/font) and the HDR (public/hdri) are self-hosted, so they need only 'self'.
 * - open.spotify.com: the music player embed.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-src https://open.spotify.com",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Features the site never uses. (clipboard-write stays allowed: the email button copies.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  // Pin the tracing root to this project. Without it, a stray lockfile in a parent
  // folder makes Next guess the wrong workspace root on local builds.
  outputFileTracingRoot: process.cwd(),
  images: { remotePatterns: [] },
  // Applied to responses from the Worker (HTML, metadata routes). Files served straight
  // from Workers static assets get theirs from public/_headers.
  async headers() {
    const headers = [...securityHeaders];
    // Dev mode uses eval for fast refresh, so the policy is production-only.
    if (process.env.NODE_ENV === "production") headers.push({ key: "Content-Security-Policy-Report-Only", value: csp });
    return [{ source: "/:path*", headers }];
  },
};
export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
