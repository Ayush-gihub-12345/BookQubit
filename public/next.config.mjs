import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Makes env.DB / env.CACHE bindings available in plain `next dev` too.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
