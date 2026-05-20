import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Setup Cloudflare bindings in dev mode
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No need for serverComponentsExternalPackages — better-sqlite3 is removed
};

export default nextConfig;
