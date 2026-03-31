import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts"],
  format: ["esm"],
  platform: "node",
  bundle: false,
  sourcemap: true,
  dts: false,
  clean: true,
});
