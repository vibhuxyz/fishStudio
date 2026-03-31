import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: true,
});
