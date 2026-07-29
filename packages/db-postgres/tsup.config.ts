import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts", "src/audit.ts", "src/outbox.ts"],
  format: ["esm"],
  platform: "node",
  bundle: false,
  sourcemap: true,
  dts: false,
  clean: true,
});
