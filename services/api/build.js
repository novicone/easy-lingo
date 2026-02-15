import * as esbuild from "esbuild";
import { copyFileSync, cpSync, mkdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Clean dist folder
rmSync(join(__dirname, "dist"), { recursive: true, force: true });

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

// Copy web frontend into dist/public
const webDistPath = join(__dirname, "..", "..", "apps", "web", "dist");
const publicPath = join(__dirname, "dist", "public");
cpSync(webDistPath, publicPath, { recursive: true });

console.log("✓ Build complete");
console.log("  - Server: dist/index.js");
console.log("  - Frontend: dist/public/");
console.log("  - Data: dist/data/");
