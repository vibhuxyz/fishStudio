/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
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
