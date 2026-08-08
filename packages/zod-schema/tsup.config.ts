import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: {
    index: "src/index.ts",
    "types/index": "src/types/index.ts",
    "schemas/index": "src/schemas/index.ts",
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
