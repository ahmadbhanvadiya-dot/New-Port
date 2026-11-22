import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  // Pin the tracing root to this project. Without it, a stray lockfile in a parent
  // folder makes Next guess the wrong workspace root on local builds.
  outputFileTracingRoot: process.cwd(),
  images: { remotePatterns: [] },
};
export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
