/** @type {import('next').NextConfig} */

// In dev, the gateway/WS run on plain http/ws localhost, so the production-grade
// CSP (https/wss only + upgrade-insecure-requests) would block every API call.
// Relax connect-src for localhost in dev and drop the http→https upgrade.
const isDev = process.env.NODE_ENV !== "production";

const connectSrc = isDev
  ? "connect-src 'self' http://localhost:* ws://localhost:* https: wss:"
  : "connect-src 'self' https: wss:";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  connectSrc,
  "worker-src 'self' blob:",
  "frame-src 'self' https:",
  "form-action 'self'",
  // Only force http→https in production; in dev it would break localhost.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // `same-origin` cuts off any popup we open to another origin, which breaks
  // payment-gateway redirect windows (Razorpay netbanking/3DS open a popup and
  // post the result back). `same-origin-allow-popups` keeps us isolated from
  // pages that open us, but lets popups we open keep their opener link.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  // HSTS only matters over HTTPS; harmless but pointless on localhost.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  {
    key: "Content-Security-Policy",
    value: csp,
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  transpilePackages: [
    "@repo/ui",
    "@repo/pricing",
    "@repo/slug",
    "@repo/zod-schema",
    "@repo/libs",
    "@repo/env-config",
    "@repo/error-handlers",
  ],
  experimental: {
    externalDir: true,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./utils/cloudinary-loader.ts",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
