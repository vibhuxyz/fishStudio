import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: [
    "src/index.ts",
    "src/client.ts",
    "src/audit.ts",
    "src/money.ts",
    "src/outbox.ts",
    "src/transaction.ts",
  ],
  format: ["esm"],
  platform: "node",
  bundle: false,
  sourcemap: true,
  dts: false,
  // See packages/db-mongo/tsup.config.ts — cleaning mid-watch races dependent
  // dev servers that import this package while dist/ is briefly empty.
  clean: !options.watch,
}));
