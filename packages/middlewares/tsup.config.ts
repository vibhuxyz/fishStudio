import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/authorizeRole.ts", "src/isAuthenticated.ts"],
  format: ["esm"],
  dts: true,
  platform: "node",
  bundle: false,
  target: "es2022",
  sourcemap: true,
  // See packages/db-mongo/tsup.config.ts — cleaning mid-watch races dependent
  // dev servers that import this package while dist/ is briefly empty.
  clean: !options.watch,
}));
