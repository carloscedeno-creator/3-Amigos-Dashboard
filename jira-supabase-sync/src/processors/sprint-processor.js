import { upsertWithRetry } from "../clients/supabase-client.js"
import { parseSprintNames } from "./issue-sprints.js"

function buildSprintRows(rows) {
  const now = new Date().toISOString()
  const byName = new Map()

  for (const row of rows) {
    const sprintNames = parseSprintNames(row.sprint_name || row.sprint)
    if (!sprintNames.length) continue

    const startDate = normalizeDate(row.sprint_start_date)
    const endDate = normalizeDate(row.sprint_end_date || row.end_date)
    const completeDate = normalizeDate(row.sprint_complete_date)
    const state = row.sprint_state || row.state || null

    for (const sprintName of sprintNames) {
      const existing = byName.get(sprintName) || {
        name: sprintName,
        start_date: null,
        end_date: null,
        complete_date: null,
        state: null,
        last_seen_at: now,
        source: "sheet",
      }

      // Prefer to keep already set dates; fill missing ones when present.
      if (!existing.start_date && startDate) existing.start_date = startDate
      if (!existing.end_date && endDate) existing.end_date = endDate
      if (!existing.complete_date && completeDate) existing.complete_date = completeDate
      if (!existing.state && state) existing.state = state

      existing.last_seen_at = now
      byName.set(sprintName, existing)
    }
  }

  return Array.from(byName.values())
}

function mapSupabaseTableError(err, table) {
  const msg = err?.message || ""
  if (msg.includes("Could not find the table")) {
    return { upserted: 0, skipped: true, reason: `missing table ${table}` }
  }
  return null
}

export async function upsertSprints({ supabase, rows, table }) {
  if (!supabase) throw new Error("upsertSprints: supabase client is required")
  if (!Array.isArray(rows)) throw new Error("upsertSprints: rows must be an array")
  if (!table) throw new Error("upsertSprints: table is required")

  const payload = buildSprintRows(rows)
  if (!payload.length) return { upserted: 0 }

  try {
    const result = await upsertWithRetry({
      supabase,
      table,
      rows: payload,
      onConflict: "name",
    })
    return { upserted: result.count }
  } catch (err) {
    const mapped = mapSupabaseTableError(err, table)
    if (mapped) return mapped
    throw err
  }
}

function normalizeDate(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

async function fetchJiraSprints({ jiraClient, boardId, state = "active,future,closed", pageSize = 50 }) {
  if (!jiraClient) throw new Error("fetchJiraSprints: jiraClient is required")
  if (!boardId) throw new Error("fetchJiraSprints: boardId is required")

  const sprints = []
  let startAt = 0
  while (true) {
    const data = await jiraClient.request({
      url: `/rest/agile/1.0/board/${boardId}/sprint`,
      params: { startAt, maxResults: pageSize, state },
    })
    const values = data?.values || []
    sprints.push(...values)
    const isLast = data?.isLast
    if (isLast || values.length === 0) break
    startAt += values.length
  }
  return sprints
}

function buildJiraSprintRows(sprints) {
  const now = new Date().toISOString()
  const seen = new Set()
  const rows = []

  for (const sprint of sprints) {
    const name = sprint?.name || `sprint-${sprint?.id ?? rows.length + 1}`
    if (seen.has(name)) continue
    seen.add(name)
    rows.push({
      name,
      start_date: normalizeDate(sprint?.startDate),
      end_date: normalizeDate(sprint?.endDate || sprint?.completeDate),
      last_seen_at: now,
      source: "jira",
    })
  }
  return rows
}

export async function processSprint({ supabase, jiraClient, boardId, table }) {
  if (!supabase) throw new Error("processSprint: supabase client is required")
  if (!jiraClient) throw new Error("processSprint: jiraClient is required")
  if (!boardId) throw new Error("processSprint: boardId is required")
  if (!table) throw new Error("processSprint: table is required")

  const sprints = await fetchJiraSprints({ jiraClient, boardId })
  if (!sprints.length) return { fetched: 0, upserted: 0 }

  const rows = buildJiraSprintRows(sprints)
  if (!rows.length) return { fetched: sprints.length, upserted: 0 }

  try {
    const result = await upsertWithRetry({
      supabase,
      table,
      rows,
      onConflict: "name",
    })
    return { fetched: sprints.length, upserted: result.count }
  } catch (err) {
    const mapped = mapSupabaseTableError(err, table)
    if (mapped) return mapped
    throw err
  }
}
