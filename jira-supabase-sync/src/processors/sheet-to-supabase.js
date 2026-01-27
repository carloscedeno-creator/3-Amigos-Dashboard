export async function upsertSheetIssues({ supabase, rows, table }) {
  if (!supabase) throw new Error("upsertSheetIssues: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("upsertSheetIssues: rows must be an array")
  if (!table) throw new Error("upsertSheetIssues: table is required")

  const payload = rows.map((row) => ({
    key: row.key || null,
    issue_id: row.issue_id || null,
    payload: row,
  }))

  const { error, status, statusText } = await supabase.from(table).upsert(payload, {
    onConflict: "key",
  })

  if (error) {
    throw new Error(`Supabase upsert failed (${status} ${statusText}): ${error.message}`)
  }

  return { status, count: payload.length }
}
