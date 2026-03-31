import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/authorizeRole.ts", "src/isAuthenticated.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: false,
});
