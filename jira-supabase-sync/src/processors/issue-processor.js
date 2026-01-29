import { upsertWithRetry } from "../clients/supabase-client.js"
import { upsertNormalizedIssues } from "./normalize-issues.js"

// For now the primary source is the sheet CSV. This wrapper remains as a
// backwards-compatible entry point.
export async function processIssues({ supabase, rows, normalizedTable }) {
  return upsertNormalizedIssues({
    supabase,
    rows,
    table: normalizedTable,
  })
}

function mapSupabaseTableError(err, table) {
  const msg = err?.message || ""
  if (msg.includes("Could not find the table")) {
    return { upserted: 0, skipped: true, reason: `missing table ${table}` }
  }
  return null
}

function extractStatusHistory(changelog) {
  const histories = changelog?.histories || []
  return histories
    .flatMap((entry) =>
      (entry.items || [])
        .filter((item) => item.field?.toLowerCase() === "status")
        .map((item) => ({
          from: item.fromString || null,
          to: item.toString || null,
          at: entry.created || null,
        })),
    )
    .filter((item) => item.to || item.from)
}

function parseStoryPoints(fields) {
  const candidates = [
    fields?.storyPoints,
    fields?.customfield_10016, // Common Jira cloud SP field
    fields?.customfield_10026,
  ]
  for (const v of candidates) {
    if (v === null || v === undefined || v === "") continue
    const num = Number(v)
    if (!Number.isNaN(num)) return num
  }
  return null
}

function parseSprintName(fields) {
  // Jira Agile stores sprint info in custom field (often customfield_10020 / 10007) as string array.
  const sprintField = fields?.sprint || fields?.customfield_10020 || fields?.customfield_10007
  if (!sprintField) return null
  if (Array.isArray(sprintField) && sprintField.length) {
    const first = sprintField[0]
    if (typeof first === "string") {
      return first.split(",")[0]?.trim() || first
    }
    if (first?.name) return first.name
  }
  if (typeof sprintField === "string") {
    return sprintField.split(",")[0]?.trim() || sprintField
  }
  if (sprintField?.name) return sprintField.name
  return null
}

function mapJiraIssue(issue) {
  const fields = issue?.fields || {}
  const statusHistory = extractStatusHistory(issue?.changelog)
  return {
    key: issue?.key || null,
    issue_id: issue?.id || null,
    summary: fields.summary || null,
    project: fields.project?.key || null,
    assignee: fields.assignee?.displayName || null,
    priority: fields.priority?.name || null,
    status: fields.status?.name || null,
    sprint: parseSprintName(fields),
    story_points: parseStoryPoints(fields),
    story_points_qa: null,
    story_points_dev: null,
    resolved: fields.resolutiondate || null,
    resolution: fields.resolution?.name || null,
    created_at: fields.created || null,
    updated_at: fields.updated || null,
    parent_key: fields.parent?.key || null,
    payload: { ...issue, status_history: statusHistory },
  }
}

async function fetchJiraIssues({ jiraClient, jql, startAt = 0, maxResults = 50 }) {
  if (!jiraClient) throw new Error("fetchJiraIssues: jiraClient is required")
  if (!jql) throw new Error("fetchJiraIssues: jql is required")

  const data = await jiraClient.request({
    url: "/rest/api/3/search",
    params: {
      jql,
      startAt,
      maxResults,
      expand: "changelog",
    },
  })

  const issues = data?.issues || []
  const total = data?.total || issues.length
  return { issues, total, maxResults }
}

export async function processIssue({
  supabase,
  jiraClient,
  table,
  jql,
  pageSize = 50,
}) {
  if (!supabase) throw new Error("processIssue: supabase client is required")
  if (!jiraClient) throw new Error("processIssue: jiraClient is required")
  if (!table) throw new Error("processIssue: table is required")
  if (!jql) throw new Error("processIssue: jql is required")

  let startAt = 0
  const allRows = []
  let total = 0

  while (true) {
    const { issues, total: reportedTotal } = await fetchJiraIssues({
      jiraClient,
      jql,
      startAt,
      maxResults: pageSize,
    })
    total = reportedTotal
    allRows.push(...issues.map(mapJiraIssue))
    startAt += issues.length
    if (issues.length === 0 || startAt >= reportedTotal) break
  }

  if (!allRows.length) {
    return { fetched: total, upserted: 0 }
  }

  try {
    const result = await upsertWithRetry({
      supabase,
      table,
      rows: allRows,
      onConflict: "key",
    })
    return { fetched: total, upserted: result.count }
  } catch (err) {
    const mapped = mapSupabaseTableError(err, table)
    if (mapped) return mapped
    throw err
  }
}
