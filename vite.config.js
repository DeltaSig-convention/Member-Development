import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the site run from any GitHub Pages path (username.github.io/repo-name/)
export default defineConfig({
  plugins: [react()],
  base: "./",
});
