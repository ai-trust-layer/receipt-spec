import { build } from "esbuild";

await build({
  entryPoints: ["docs/vendor/ajv-bundle.entry.js"],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  globalName: "AjvBundle",
  outfile: "docs/vendor/ajv-bundle.js",
});

console.log("Built docs/vendor/ajv-bundle.js");
