const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

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

export function getConfig() {
  const sheetCsvUrl =
    process.env.SHEET_CSV_URL ||
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTn7C3JqBIEEMzWv5mv-kzgvko3yzBeTdZi2VT7HDV85_kgf6-WuGg7B1O0yG7kWFJBNqRtRK9NKdH1/pub?output=csv"

  const supabaseIssuesTable = process.env.SUPABASE_ISSUES_TABLE || "sheet_issues_raw"
  const supabaseIssuesNormalizedTable =
    process.env.SUPABASE_ISSUES_NORMALIZED_TABLE || "issues_normalized"

  return {
    // Optional for Jira (not needed for CSV->Supabase path)
    jiraBaseUrl: readEnvOptional("JIRA_BASE_URL"),
    jiraApiToken: readEnvOptional("JIRA_API_TOKEN"),
    supabaseUrl: readEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
    syncIntervalMinutes: Number(process.env.SYNC_INTERVAL_MINUTES || 30),
    sheetCsvUrl,
    supabaseIssuesTable,
    supabaseIssuesNormalizedTable,
  }
}
