/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Proxies API calls through this app's own origin so the auth-service's
  // Set-Cookie responses land as first-party cookies. Calling the API
  // directly cross-origin (its own domain) meant browsers with third-party
  // cookie blocking (the Vercel preview/production default) silently
  // dropped the session cookie, so login appeared to succeed but the
  // dashboard's auth guard never found a session and bounced back to /login.
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_SERVER_URI ||
      "http://localhost:8080";
    return [
      {
        source:
          "/:service(auth|product|order|notification|seller)/api/:path*",
        destination: `${apiUrl}/:service/api/:path*`,
      },
    ];
  },
  experimental: {
    externalDir: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
  },
  transpilePackages: [
    "@repo/ui",
    "@repo/zod-schema",
    "@repo/libs",
    "@repo/env-config",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
