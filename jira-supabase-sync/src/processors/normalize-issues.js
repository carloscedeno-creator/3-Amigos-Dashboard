function normalizeSheetIssue(row) {
  return {
    key: row.key || null,
    issue_id: row.issue_id || null,
    summary: row.summary || null,
    project: row.project || null,
    assignee: row.assignee || null,
    priority: row.priority || null,
    status: row.status || null,
    sprint: row.sprint || null,
    story_points: row.story_point_estimate || null,
    story_points_qa: row.story_point_estimate_qa || null,
    story_points_dev: row.story_point_estimate_dev || null,
    resolved: row.resolved || null,
    resolution: row.resolution || null,
    created_at: row.created || null,
    parent_key: row.parent || null,
    payload: row, // keep full source for traceability
  }
}

export async function upsertNormalizedIssues({ supabase, rows, table }) {
  if (!supabase) throw new Error("upsertNormalizedIssues: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("upsertNormalizedIssues: rows must be an array")
  if (!table) throw new Error("upsertNormalizedIssues: table is required")

  const payload = rows.map(normalizeSheetIssue)

  const { error, status, statusText } = await supabase.from(table).upsert(payload, {
    onConflict: "key",
  })

  if (error) {
    throw new Error(`Supabase normalized upsert failed (${status} ${statusText}): ${error.message}`)
  }

  return { status, count: payload.length }
}
