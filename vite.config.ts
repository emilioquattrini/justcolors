import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// === IMPORTANTE ===
// GitHub Pages URL: https://username.github.io/justcolors/
const BASE = '/justcolors/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Allow importing JSON files as modules
  json: {
    stringify: false,
  },
});
