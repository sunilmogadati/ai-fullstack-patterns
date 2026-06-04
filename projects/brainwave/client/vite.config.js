import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Vite is invoked from the project root (so the package.json + node_modules
// resolve correctly) but the actual app source lives in client/. Setting
// `root` to this config file's directory makes the index.html + src/
// directory resolve correctly.
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 5175,
  },
});
