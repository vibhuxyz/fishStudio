import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "pricing/index": "src/pricing/index.ts",
    "slug/index": "src/slug/index.ts",
    "order-id/index": "src/order-id/index.ts",
    "payment-id/index": "src/payment-id/index.ts",
    "whatsapp/index": "src/whatsapp/index.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  dts: true,
  skipNodeModulesBundle: true,
});
