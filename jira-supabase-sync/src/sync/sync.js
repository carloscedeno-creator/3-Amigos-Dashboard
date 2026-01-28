import { getConfig } from "../config.js"
import { loadSheetData } from "../clients/sheet-client.js"
import { getSupabaseClient } from "../clients/supabase-client.js"
import { upsertSheetIssues } from "../processors/sheet-to-supabase.js"
import { syncIssueSprints } from "../processors/issue-sprints.js"
import { computeSprintMetrics } from "../processors/compute-sprint-metrics.js"
import { detectScopeChanges } from "../processors/scope-change-detector.js"
import { upsertSprints } from "../processors/sprint-processor.js"
import { processIssues } from "../processors/issue-processor.js"

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

async function runSheetPipeline({ config, supabase, sheetData }) {
  const upsertRaw = await upsertSheetIssues({
    supabase,
    rows: sheetData.mapped,
    table: config.supabaseIssuesTable,
  })

  const upsertNormalized = await processIssues({
    supabase,
    rows: sheetData.mapped,
    normalizedTable: config.supabaseIssuesNormalizedTable,
  })

  const sprintUpserts = await upsertSprints({
    supabase,
    rows: sheetData.mapped,
    table: config.supabaseSprintsTable,
  })

  const scopeChanges = await detectScopeChanges({
    supabase,
    rows: sheetData.mapped,
    issueSprintsTable: config.supabaseIssueSprintsTable,
    scopeChangesTable: config.supabaseScopeChangesTable,
  })

  const issueSprints = await syncIssueSprints({
    supabase,
    rows: sheetData.mapped,
    table: config.supabaseIssueSprintsTable,
  })

  const sprintMetrics = await computeSprintMetrics({
    supabase,
    rows: sheetData.mapped,
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

export async function incrementalSync(providedConfig) {
  const config = providedConfig || getConfig()
  const sheetData = await loadSheetData(config.sheetCsvUrl)
  const supabase = getSupabaseClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  })

  const pipeline = await runSheetPipeline({ config, supabase, sheetData })
  const syncState = await updateSyncState({
    supabase,
    table: config.supabaseSyncStateTable,
    type: "incremental",
  })

  return {
    mode: "incremental",
    config,
    sheetRows: sheetData.mapped.length,
    ...pipeline,
    syncState,
  }
}

export async function fullSync(providedConfig) {
  const config = providedConfig || getConfig()
  const sheetData = await loadSheetData(config.sheetCsvUrl)
  const supabase = getSupabaseClient({
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
  })

  const pipeline = await runSheetPipeline({ config, supabase, sheetData })
  const syncState = await updateSyncState({
    supabase,
    table: config.supabaseSyncStateTable,
    type: "full",
  })

  return {
    mode: "full",
    config,
    sheetRows: sheetData.mapped.length,
    ...pipeline,
    syncState,
  }
}
