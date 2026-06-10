import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cronManager.ts", "src/jobs/cleanup.jobs.ts", "src/jobs/abandoned-cart.job.ts", "src/jobs/stale-orders.job.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: true,
  clean: false,
});
