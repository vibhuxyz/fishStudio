import { defineConfig } from "tsup";

export default defineConfig({
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
  clean: true,
});
