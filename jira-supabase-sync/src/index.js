// Load local .env first (cwd), then fallback to repo root .env
/* global process */
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../.env") })
dotenv.config({ path: path.resolve(__dirname, "../../.env") })
import { fullSync, incrementalSync } from "./sync/sync.js"

async function main() {
  const mode = process.env.SYNC_MODE === "full" ? "full" : "incremental"
  const result = mode === "full" ? await fullSync() : await incrementalSync()
  return result
}

main().catch((error) => {
  process.stderr.write(`Sync service failed: ${error.message}\n`)
  process.exit(1)
})
