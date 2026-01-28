import { upsertNormalizedIssues } from "./normalize-issues.js"

// For now the primary source is the sheet CSV. This wrapper exists so the
// Jira-based path can be plugged in later without changing callers.
export async function processIssues({ supabase, rows, normalizedTable }) {
  return upsertNormalizedIssues({
    supabase,
    rows,
    table: normalizedTable,
  })
}
