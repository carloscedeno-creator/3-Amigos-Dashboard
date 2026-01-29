import { getConfig } from "../config.js"
import { loadSheetData } from "../clients/sheet-client.js"
import { getSupabaseClient } from "../clients/supabase-client.js"
import { createJiraClient } from "../clients/jira-client.js"
import { upsertSheetIssues } from "../processors/sheet-to-supabase.js"
import { syncIssueSprints } from "../processors/issue-sprints.js"
import { computeSprintMetrics } from "../processors/compute-sprint-metrics.js"
import { detectScopeChanges } from "../processors/scope-change-detector.js"
import { processSprint, upsertSprints } from "../processors/sprint-processor.js"
import { processIssue, processIssues } from "../processors/issue-processor.js"

async function updateSyncState({ supabase, table, type }) {
  const now = new Date().toISOString()
  const payload =
    type === "full"
      ? { id: "singleton", last_full_at: now, last_incremental_at: now }
      : { id: "singleton", last_incremental_at: now }

  const { error } = await supabase.from(table).upsert(payload, { onConflict: "id" })
  if (error) {
    const msg = error.message || ""
    if (msg.includes("Could not find the table")) {
      return { skipped: true, reason: `missing table ${table}` }
    }
    throw new Error(`updateSyncState: failed to upsert: ${error.message}`)
  }
  return { updated: true }
}

function dedupeRowsByKey(rows) {
  const byKey = new Map()
  for (const row of rows || []) {
    const id = row.key || row.issue_id
    if (!id) continue
    byKey.set(id, row) // keep last occurrence
  }
  return Array.from(byKey.values())
}

async function runSheetPipeline({ config, supabase, rows }) {
  const upsertRaw = await upsertSheetIssues({
    supabase,
    rows,
    table: config.supabaseIssuesTable,
  })

  const upsertNormalized = await processIssues({
    supabase,
    rows,
    normalizedTable: config.supabaseIssuesNormalizedTable,
  })

  const sprintUpserts = await upsertSprints({
    supabase,
    rows,
    table: config.supabaseSprintsTable,
  })

  const scopeChanges = await detectScopeChanges({
    supabase,
    rows,
    issueSprintsTable: config.supabaseIssueSprintsTable,
    scopeChangesTable: config.supabaseScopeChangesTable,
  })

  const issueSprints = await syncIssueSprints({
    supabase,
    rows,
    table: config.supabaseIssueSprintsTable,
  })

  const sprintMetrics = await computeSprintMetrics({
    supabase,
    rows,
    issueSprintsTable: config.supabaseIssueSprintsTable,
    sprintMetricsTable: config.supabaseSprintMetricsTable,
  })

  return {
    upsertRaw,
    upsertNormalized,
    sprintUpserts,
    scopeChanges,
    issueSprints,
    sprintMetrics,
  }
}

function buildJiraMissingReasons(config) {
  if (!config.jiraSyncEnabled) return ["JIRA_SYNC_ENABLED=false"]
  const missing = []
  if (!config.jiraBaseUrl) missing.push("JIRA_BASE_URL")
  if (!config.jiraApiToken) missing.push("JIRA_API_TOKEN")
  if (!config.jiraBoardId) missing.push("JIRA_BOARD_ID")
  return missing
}

async function maybeSyncJiraSprints({ config, supabase }) {
  const missing = buildJiraMissingReasons(config)
  if (missing.length) {
    return { skipped: true, reason: `missing ${missing.join(", ")}` }
  }

  const jiraClient = createJiraClient({
    baseUrl: config.jiraBaseUrl,
    apiToken: config.jiraApiToken,
  })

  return processSprint({
    supabase,
    jiraClient,
    boardId: config.jiraBoardId,
    table: config.supabaseSprintsTable,
  })
}

function buildJiraIssuesMissingReasons(config) {
  if (!config.jiraSyncEnabled) return ["JIRA_SYNC_ENABLED=false"]
  const missing = []
  if (!config.jiraBaseUrl) missing.push("JIRA_BASE_URL")
  if (!config.jiraApiToken) missing.push("JIRA_API_TOKEN")
  if (!config.jiraJql) missing.push("JIRA_JQL")
  return missing
}

async function maybeSyncJiraIssues({ config, supabase }) {
  const missing = buildJiraIssuesMissingReasons(config)
  if (missing.length) {
    return { skipped: true, reason: `missing ${missing.join(", ")}` }
  }

  const jiraClient = createJiraClient({
    baseUrl: config.jiraBaseUrl,
    apiToken: config.jiraApiToken,
  })

  return processIssue({
    supabase,
    jiraClient,
    table: config.supabaseIssuesNormalizedTable,
    jql: config.jiraJql,
  })
}

export async function incrementalSync(providedConfig) {
  const config = providedConfig || getConfig()
  const sheetData = await loadSheetData(config.sheetCsvUrl)
  const dedupedRows = dedupeRowsByKey(sheetData.mapped)
  const supabase = getSupabaseClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  })

  const pipeline = await runSheetPipeline({ config, supabase, rows: dedupedRows })
  const jiraSprints = await maybeSyncJiraSprints({ config, supabase })
  const jiraIssues = await maybeSyncJiraIssues({ config, supabase })
  const syncState = await updateSyncState({
    supabase,
    table: config.supabaseSyncStateTable,
    type: "incremental",
  })

  const summary = {
    mode: "incremental",
    sheetRows: sheetData.mapped.length,
    dedupedRows: dedupedRows.length,
    upsertRaw: pipeline.upsertRaw?.count ?? pipeline.upsertRaw,
    upsertNormalized: pipeline.upsertNormalized?.count ?? pipeline.upsertNormalized,
    sprintUpserts: pipeline.sprintUpserts?.upserted ?? pipeline.sprintUpserts,
    scopeChanges: pipeline.scopeChanges?.upserted ?? pipeline.scopeChanges,
    issueSprints: pipeline.issueSprints?.upserted ?? pipeline.issueSprints,
    sprintMetrics: pipeline.sprintMetrics?.upserted ?? pipeline.sprintMetrics,
    jiraSprints,
    jiraIssues,
    syncState,
  }

  console.info("[sync] summary", summary)

  return {
    mode: "incremental",
    config,
    sheetRows: sheetData.mapped.length,
    dedupedRows: dedupedRows.length,
    ...pipeline,
    jiraSprints,
    jiraIssues,
    syncState,
  }
}

export async function fullSync(providedConfig) {
  const config = providedConfig || getConfig()
  const sheetData = await loadSheetData(config.sheetCsvUrl)
  const dedupedRows = dedupeRowsByKey(sheetData.mapped)
  const supabase = getSupabaseClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  })

  const pipeline = await runSheetPipeline({ config, supabase, rows: dedupedRows })
  const jiraSprints = await maybeSyncJiraSprints({ config, supabase })
  const jiraIssues = await maybeSyncJiraIssues({ config, supabase })
  const syncState = await updateSyncState({
    supabase,
    table: config.supabaseSyncStateTable,
    type: "full",
  })

  const summary = {
    mode: "full",
    sheetRows: sheetData.mapped.length,
    dedupedRows: dedupedRows.length,
    upsertRaw: pipeline.upsertRaw?.count ?? pipeline.upsertRaw,
    upsertNormalized: pipeline.upsertNormalized?.count ?? pipeline.upsertNormalized,
    sprintUpserts: pipeline.sprintUpserts?.upserted ?? pipeline.sprintUpserts,
    scopeChanges: pipeline.scopeChanges?.upserted ?? pipeline.scopeChanges,
    issueSprints: pipeline.issueSprints?.upserted ?? pipeline.issueSprints,
    sprintMetrics: pipeline.sprintMetrics?.upserted ?? pipeline.sprintMetrics,
    jiraSprints,
    jiraIssues,
    syncState,
  }

  console.info("[sync] summary", summary)

  return {
    mode: "full",
    config,
    sheetRows: sheetData.mapped.length,
    dedupedRows: dedupedRows.length,
    ...pipeline,
    jiraSprints,
    jiraIssues,
    syncState,
  }
}
