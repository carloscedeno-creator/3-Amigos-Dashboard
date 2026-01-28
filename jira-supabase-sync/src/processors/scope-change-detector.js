import { parseSprintNames } from "./issue-sprints.js"

function pickStoryPoints(row) {
  const candidates = [
    row.story_point_estimate,
    row.story_points,
    row.story_point_estimate_dev,
    row.story_point_estimate_qa,
  ]
  for (const v of candidates) {
    if (v === null || v === undefined || v === "") continue
    const num = Number(v)
    if (!Number.isNaN(num)) return num
  }
  return null
}

function buildCurrentMap(rows) {
  const map = new Map()
  for (const row of rows) {
    const issueKey = row.key
    if (!issueKey) continue
    const sprintNames = parseSprintNames(row.sprint)
    if (!sprintNames.length) continue
    const sp = pickStoryPoints(row)
    const status = row.status || null

    for (const sprintName of sprintNames) {
      const key = `${issueKey}::${sprintName}`
      map.set(key, { issue_key: issueKey, sprint_name: sprintName, story_points: sp, status_at_change: status })
    }
  }
  return map
}

function buildExistingMap(rows) {
  const map = new Map()
  for (const row of rows || []) {
    const key = `${row.issue_key}::${row.sprint_name}`
    map.set(key, {
      issue_key: row.issue_key,
      sprint_name: row.sprint_name,
      story_points: row.story_points_at_sync,
      status_at_change: row.status_at_sync || null,
      is_removed: row.is_removed,
    })
  }
  return map
}

function diffScope({ currentMap, existingMap }) {
  const changes = []
  const now = new Date().toISOString()

  for (const [key, curr] of currentMap.entries()) {
    const prev = existingMap.get(key)
    if (!prev) {
      changes.push({
        issue_key: curr.issue_key,
        sprint_name: curr.sprint_name,
        change_type: "added",
        from_sp: null,
        to_sp: curr.story_points,
        status_at_change: curr.status_at_change,
        changed_at: now,
      })
      continue
    }

    const prevSp = prev.story_points
    const currSp = curr.story_points
    if (prevSp !== currSp) {
      changes.push({
        issue_key: curr.issue_key,
        sprint_name: curr.sprint_name,
        change_type: "story_points_changed",
        from_sp: prevSp,
        to_sp: currSp,
        status_at_change: curr.status_at_change,
        changed_at: now,
      })
    }
  }

  for (const [key, prev] of existingMap.entries()) {
    if (!currentMap.has(key) && !prev.is_removed) {
      changes.push({
        issue_key: prev.issue_key,
        sprint_name: prev.sprint_name,
        change_type: "removed",
        from_sp: prev.story_points,
        to_sp: null,
        status_at_change: prev.status_at_change,
        changed_at: now,
      })
    }
  }

  return changes
}

export async function detectScopeChanges({
  supabase,
  rows,
  issueSprintsTable,
  scopeChangesTable,
}) {
  if (!supabase) throw new Error("detectScopeChanges: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("detectScopeChanges: rows must be an array")
  if (!issueSprintsTable) throw new Error("detectScopeChanges: issueSprintsTable is required")
  if (!scopeChangesTable) throw new Error("detectScopeChanges: scopeChangesTable is required")

  const currentMap = buildCurrentMap(rows)
  if (!currentMap.size) return { inserted: 0 }

  const issueKeys = [...new Set([...currentMap.values()].map((r) => r.issue_key))]
  const { data: existingRows, error: existingError } = await supabase
    .from(issueSprintsTable)
    .select("issue_key, sprint_name, story_points_at_sync, status_at_sync, is_removed")
    .in("issue_key", issueKeys)

  if (existingError) {
    const msg = existingError.message || ""
    if (msg.includes("Could not find the table")) {
      return { inserted: 0, skipped: true, reason: `missing table ${issueSprintsTable}` }
    }
    throw new Error(`detectScopeChanges: fetch existing failed: ${existingError.message}`)
  }

  const existingMap = buildExistingMap(existingRows)
  const changes = diffScope({ currentMap, existingMap })
  if (!changes.length) return { inserted: 0 }

  const { error: insertError } = await supabase.from(scopeChangesTable).insert(changes)
  if (insertError) {
    const msg = insertError.message || ""
    if (msg.includes("Could not find the table")) {
      return { inserted: 0, skipped: true, reason: `missing table ${scopeChangesTable}` }
    }
    throw new Error(`detectScopeChanges: insert failed: ${insertError.message}`)
  }

  return { inserted: changes.length }
}
