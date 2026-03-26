import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  skipNodeModulesBundle: true,
  sourcemap: false,
  minify: false,
});
