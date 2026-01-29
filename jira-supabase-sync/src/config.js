/* global process */

function readEnv(key) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env var: ${key}`)
  }
  return value
}

function readEnvOptional(key) {
  return process.env[key] || null
}

function readEnvBoolOptional(key, defaultValue = false) {
  const val = process.env[key]
  if (val == null) return defaultValue
  const normalized = String(val).toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
}

export function getConfig() {
  const sheetCsvUrl =
    process.env.SHEET_CSV_URL ||
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTn7C3JqBIEEMzWv5mv-kzgvko3yzBeTdZi2VT7HDV85_kgf6-WuGg7B1O0yG7kWFJBNqRtRK9NKdH1/pub?output=csv"

  const supabaseIssuesTable = process.env.SUPABASE_ISSUES_TABLE || "sheet_issues_raw"
  const supabaseIssuesNormalizedTable =
    process.env.SUPABASE_ISSUES_NORMALIZED_TABLE || "issues_normalized"
  const supabaseIssueSprintsTable =
    process.env.SUPABASE_ISSUE_SPRINTS_TABLE || "issue_sprints"
  const supabaseSprintMetricsTable =
    process.env.SUPABASE_SPRINT_METRICS_TABLE || "sprint_metrics"
  const supabaseScopeChangesTable =
    process.env.SUPABASE_SCOPE_CHANGES_TABLE || "sprint_scope_changes"
  const supabaseSyncStateTable = process.env.SUPABASE_SYNC_STATE_TABLE || "sync_state"
  const supabaseSprintsTable = process.env.SUPABASE_SPRINTS_TABLE || "sprints"

  return {
    // Optional for Jira (not needed for CSV->Supabase path)
    jiraBaseUrl: readEnvOptional("JIRA_BASE_URL"),
    jiraApiToken: readEnvOptional("JIRA_API_TOKEN"),
    jiraBoardId: readEnvOptional("JIRA_BOARD_ID"),
    jiraJql: readEnvOptional("JIRA_JQL"),
    jiraSyncEnabled: readEnvBoolOptional("JIRA_SYNC_ENABLED", false),
    supabaseUrl: readEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
    syncIntervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES || 30),
    sheetCsvUrl,
    supabaseIssuesTable,
    supabaseIssuesNormalizedTable,
    supabaseIssueSprintsTable,
    supabaseSprintMetricsTable,
    supabaseScopeChangesTable,
    supabaseSyncStateTable,
    supabaseSprintsTable,
  }
}
