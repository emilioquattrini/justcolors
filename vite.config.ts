import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// Relative assets keep the build working both on the GitHub Pages project URL
// and on a custom campaign subdomain such as vaguevase.justcolors.net.
const BASE = './'

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
