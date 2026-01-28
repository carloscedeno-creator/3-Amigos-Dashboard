export function parseSprintNames(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter(Boolean)
  }
  const text = String(value)
  const cleaned = text.replace(/[[\]]/g, "")
  return cleaned
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function buildCurrentAssociations(rows) {
  const associations = []
  for (const row of rows) {
    const issueKey = row.key
    if (!issueKey) continue
    const sprintNames = parseSprintNames(row.sprint)
    if (!sprintNames.length) continue

    for (const sprintName of sprintNames) {
      associations.push({
        issue_key: issueKey,
        sprint_name: sprintName,
        status_at_sync: row.status || null,
        story_points_at_sync:
          row.story_point_estimate ?? row.story_points ?? row.story_point_estimate_dev ?? null,
        updated_at: new Date().toISOString(),
      })
    }
  }
  return associations
}

function buildKey(sprintRow) {
  return `${sprintRow.issue_key}::${sprintRow.sprint_name}`
}

export async function syncIssueSprints({ supabase, rows, table }) {
  if (!supabase) throw new Error("syncIssueSprints: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("syncIssueSprints: rows must be an array")
  if (!table) throw new Error("syncIssueSprints: table is required")

  const currentAssociations = buildCurrentAssociations(rows)
  if (!currentAssociations.length) {
    return { upserted: 0, markedRemoved: 0 }
  }

  const issueKeys = [...new Set(currentAssociations.map((row) => row.issue_key))]

  const { data: existingRows, error: existingError } = await supabase
    .from(table)
    .select("id, issue_key, sprint_name, is_removed")
    .in("issue_key", issueKeys)

  if (existingError) {
    throw new Error(`syncIssueSprints: fetch existing failed: ${existingError.message}`)
  }

  const existingMap = new Map()
  for (const row of existingRows || []) {
    existingMap.set(buildKey(row), row)
  }

  const toUpsert = currentAssociations.map((row) => ({
    ...row,
    is_removed: false,
  }))

  const currentKeys = new Set(currentAssociations.map(buildKey))
  const toMarkRemoved = []

  for (const row of existingRows || []) {
    const key = buildKey(row)
    if (!currentKeys.has(key) && !row.is_removed) {
      toMarkRemoved.push(row.id)
    }
  }

  const { error: upsertError } = await supabase.from(table).upsert(toUpsert, {
    onConflict: "issue_key,sprint_name",
  })

  if (upsertError) {
    throw new Error(`syncIssueSprints: upsert failed: ${upsertError.message}`)
  }

  if (toMarkRemoved.length) {
    const { error: removeError } = await supabase
      .from(table)
      .update({ is_removed: true, removed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .in("id", toMarkRemoved)

    if (removeError) {
      throw new Error(`syncIssueSprints: mark removed failed: ${removeError.message}`)
    }
  }

  return {
    upserted: toUpsert.length,
    markedRemoved: toMarkRemoved.length,
  }
}
