import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  platform: "node",
  clean: true,
  // Bundle all @repo/* workspace packages EXCEPT @repo/config which
  // must stay external: it uses dotenv (CJS) + import.meta.url to
  // locate the .env file relative to its own dist/ output.
  noExternal: [/^@repo\/(?!config).+/],
  // Native addons cannot be bundled — keep them external
  external: ["argon2"],
});
