import { defineConfig } from "tsup";

// Bundles src/ (and the shared ../types it imports) into one ESM file for Render.
// Type-checking is a separate step: `npm run typecheck`.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: false,
});
