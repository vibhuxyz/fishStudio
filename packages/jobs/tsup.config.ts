import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/cronManager.ts", "src/jobs/*.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: true,
  sourcemap: true,
  // See packages/db-mongo/tsup.config.ts — cleaning mid-watch races dependent
  // dev servers that import this package while dist/ is briefly empty.
  clean: !options.watch,
}));
