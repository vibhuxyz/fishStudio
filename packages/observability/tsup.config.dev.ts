import { defineConfig } from "tsup";

export default defineConfig({
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
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: false,
});
