import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  // Every file re-exported from index.ts needs its own entry: `bundle: false`
  // emits one output per entry and leaves the re-export specifiers untouched,
  // so a missing entry resolves to a file that was never written.
  entry: [
    "src/index.ts",
    "src/context.ts",
    "src/correlation.ts",
    "src/logging.ts",
    "src/tracing.ts",
    "src/registry.ts",
    "src/http-logging.ts",
    "src/http-metrics.ts",
    "src/metrics-route.ts",
    "src/health.ts",
  ],
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
