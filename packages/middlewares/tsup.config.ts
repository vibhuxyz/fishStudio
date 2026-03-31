import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/authorizeRole.ts", "src/isAuthenticated.ts"],
  format: ["esm"],
  dts: true,
  platform: "node",
  bundle: false,
  target: "es2022",
  sourcemap: true,
  clean: true,
});
