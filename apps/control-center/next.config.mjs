/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone traces the exact files the server needs and copies them into
  // .next/standalone, so the Docker image carries no monorepo node_modules.
  output: "standalone",
  // Without this, tracing starts at apps/control-center and misses the hoisted
  // node_modules at the workspace root.
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
