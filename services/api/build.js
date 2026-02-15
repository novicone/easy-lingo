import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.js",
  external: ["fastify", "@fastify/static", "papaparse"],
  sourcemap: true,
});

// Copy data files
mkdirSync(join(__dirname, "dist", "data"), { recursive: true });
copyFileSync(
  join(__dirname, "src", "data", "unit4_vocabulary.csv"),
  join(__dirname, "dist", "data", "unit4_vocabulary.csv"),
);

console.log("✓ Build complete");
