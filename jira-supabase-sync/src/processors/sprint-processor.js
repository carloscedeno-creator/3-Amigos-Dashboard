import { upsertWithRetry } from "../clients/supabase-client.js"
import { parseSprintNames } from "./issue-sprints.js"

function buildSprintRows(rows) {
  const seen = new Set()
  const payload = []
  const now = new Date().toISOString()

  for (const row of rows) {
    const sprintNames = parseSprintNames(row.sprint)
    for (const sprintName of sprintNames) {
      if (seen.has(sprintName)) continue
      seen.add(sprintName)
      payload.push({
        name: sprintName,
        last_seen_at: now,
        source: "sheet",
      })
    }
  }
  return payload
}

export async function upsertSprints({ supabase, rows, table }) {
  if (!supabase) throw new Error("upsertSprints: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("upsertSprints: rows must be an array")
  if (!table) throw new Error("upsertSprints: table is required")

  const payload = buildSprintRows(rows)
  if (!payload.length) return { upserted: 0 }

  const result = await upsertWithRetry({
    supabase,
    table,
    rows: payload,
    onConflict: "name",
  })

  return { upserted: result.count }
}
