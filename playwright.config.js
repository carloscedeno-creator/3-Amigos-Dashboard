// @ts-check
import { defineConfig } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, ".env") })

const PORT = 4173
const HOST = "localhost"

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    headless: true,
  },
  webServer: {
    command: `npm run dev -- --host --port ${PORT}`,
    url: `http://${HOST}:${PORT}/`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
