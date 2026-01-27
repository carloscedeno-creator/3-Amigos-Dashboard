// Load local .env first (cwd), then fallback to repo root .env
import dotenv from "dotenv"
dotenv.config()
dotenv.config({ path: new URL("../.env", import.meta.url).pathname })
dotenv.config({ path: new URL("../../.env", import.meta.url).pathname })
import { getConfig } from "./config.js"
import { loadSheetData } from "./clients/sheet-client.js"
import { getSupabaseClient } from "./clients/supabase-client.js"
import { upsertSheetIssues } from "./processors/sheet-to-supabase.js"

async function main() {
  const config = getConfig()
  const sheetData = await loadSheetData(config.sheetCsvUrl)

  const supabase = getSupabaseClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  })

  const upsertResult = await upsertSheetIssues({
    supabase,
    rows: sheetData.mapped,
    table: config.supabaseIssuesTable,
  })

  return {
    config,
    sheetRows: sheetData.mapped.length,
    supabaseUpserted: upsertResult.count,
  }
}

main().catch((error) => {
  process.stderr.write(`Sync service failed: ${error.message}\n`)
  process.exit(1)
})
