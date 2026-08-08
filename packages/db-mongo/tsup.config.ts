import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/client.ts"],
  format: ["esm"],
  platform: "node",
  target: "es2022",
  bundle: false,
  dts: false,
  sourcemap: true,
  // In --watch mode `clean` wipes dist/ before every rebuild, which leaves a
  // window where a dependent dev server (e.g. product-service's tsx watch)
  // resolves the import mid-rebuild and crashes with ERR_MODULE_NOT_FOUND.
  // A plain `build` still gets a full clean.
  clean: !options.watch,
}));
