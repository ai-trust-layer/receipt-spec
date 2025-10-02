import { build } from "esbuild";
await build({
  entryPoints: ["docs/vendor/jszip-entry.js"],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  globalName: "JSZipBundle",
  outfile: "docs/vendor/jszip-bundle.js",
});
console.log("Built docs/vendor/jszip-bundle.js");
