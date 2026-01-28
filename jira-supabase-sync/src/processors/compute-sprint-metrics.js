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
  return 0
}

function isDone(row) {
  if (row.resolved) return true
  const status = (row.status || "").toLowerCase()
  return status === "done" || status === "resolved" || status === "closed"
}

function addStatusCount(map, status) {
  const key = status || "Unknown"
  map[key] = (map[key] || 0) + 1
}

function aggregateCurrent(rows) {
  const sprintMap = new Map()

  for (const row of rows) {
    const sprintNames = parseSprintNames(row.sprint)
    if (!sprintNames.length) continue

    const sp = pickStoryPoints(row)
    const done = isDone(row)
    const status = row.status || null

    for (const sprintName of sprintNames) {
      const acc = sprintMap.get(sprintName) || {
        issues_total: 0,
        issues_done: 0,
        sp_total: 0,
        sp_done: 0,
        status_counts: {},
      }
      acc.issues_total += 1
      acc.sp_total += sp
      if (done) {
        acc.issues_done += 1
        acc.sp_done += sp
      }
      addStatusCount(acc.status_counts, status)
      sprintMap.set(sprintName, acc)
    }
  }

  return sprintMap
}

function aggregateRemoved(rows) {
  const removed = new Map()
  for (const row of rows || []) {
    const acc = removed.get(row.sprint_name) || {
      removed_count: 0,
      removed_sp: 0,
    }
    acc.removed_count += 1
    const sp = Number(row.story_points_at_sync) || 0
    acc.removed_sp += sp
    removed.set(row.sprint_name, acc)
  }
  return removed
}

export async function computeSprintMetrics({
  supabase,
  rows,
  issueSprintsTable,
  sprintMetricsTable,
}) {
  if (!supabase) throw new Error("computeSprintMetrics: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("computeSprintMetrics: rows must be an array")
  if (!issueSprintsTable) throw new Error("computeSprintMetrics: issueSprintsTable is required")
  if (!sprintMetricsTable) throw new Error("computeSprintMetrics: sprintMetricsTable is required")

  const currentAgg = aggregateCurrent(rows)

  const { data: removedRows, error: removedError } = await supabase
    .from(issueSprintsTable)
    .select("sprint_name, story_points_at_sync")
    .eq("is_removed", true)

  if (removedError) {
    const msg = removedError.message || ""
    if (msg.includes("Could not find the table")) {
      return { upserted: 0, skipped: true, reason: `missing table ${issueSprintsTable}` }
    }
    throw new Error(
      `computeSprintMetrics: failed to read removed scope (${issueSprintsTable}): ${removedError.message}`,
    )
  }

  const removedAgg = aggregateRemoved(removedRows)

  const payload = []
  const sprintNames = new Set([...currentAgg.keys(), ...removedAgg.keys()])
  const now = new Date().toISOString()

  for (const sprintName of sprintNames) {
    const curr = currentAgg.get(sprintName) || {
      issues_total: 0,
      issues_done: 0,
      sp_total: 0,
      sp_done: 0,
      status_counts: {},
    }
    const rem = removedAgg.get(sprintName) || {
      removed_count: 0,
      removed_sp: 0,
    }

    payload.push({
      sprint_name: sprintName,
      metrics: {
        issues_total: curr.issues_total,
        issues_done: curr.issues_done,
        sp_total: curr.sp_total,
        sp_done: curr.sp_done,
        removed_count: rem.removed_count,
        removed_sp: rem.removed_sp,
        status_counts: curr.status_counts,
      },
      updated_at: now,
    })
  }

  if (!payload.length) {
    return { upserted: 0 }
  }

  const { error: upsertError, status, statusText } = await supabase
    .from(sprintMetricsTable)
    .upsert(payload, { onConflict: "sprint_name" })

  if (upsertError) {
    const msg = upsertError.message || ""
    if (msg.includes("Could not find the table")) {
      return { upserted: 0, skipped: true, reason: `missing table ${sprintMetricsTable}` }
    }
    throw new Error(
      `computeSprintMetrics: upsert failed (${status} ${statusText}): ${upsertError.message}`,
    )
  }

  return { upserted: payload.length }
}
