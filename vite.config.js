/* global process */
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path needed for GitHub Pages: https://<user>.github.io/3-Amigos-Dashboard/
  base: process.env.GITHUB_PAGES_BASE || "/3-Amigos-Dashboard/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["host.docker.internal"],
  },
})
