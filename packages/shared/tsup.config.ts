import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: {
    "pricing/index": "src/pricing/index.ts",
    "slug/index": "src/slug/index.ts",
    "order-id/index": "src/order-id/index.ts",
    "payment-id/index": "src/payment-id/index.ts",
    "payment-state/index": "src/payment-state/index.ts",
    "whatsapp/index": "src/whatsapp/index.ts",
    "store-hours/index": "src/store-hours/index.ts",
    "data/index": "src/data/index.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  // See packages/db-mongo/tsup.config.ts — cleaning mid-watch races dependent
  // dev servers that import this package while dist/ is briefly empty.
  clean: !options.watch,
  dts: true,
  skipNodeModulesBundle: true,
}));
