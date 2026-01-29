/* global process */
import { describe, expect, it } from "vitest"
import { getConfig } from "./config.js"

const REQUIRED = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]

function withEnv(temp, fn) {
  const prev = { ...process.env }
  Object.assign(process.env, temp)
  try {
    fn()
  } finally {
    process.env = prev
  }
}

describe("config", () => {
  it("throws if required env vars are missing", () => {
    REQUIRED.forEach((key) => delete process.env[key])
    expect(() => getConfig()).toThrow(/Missing required env var/)
  })

  it("returns optional values with defaults", () => {
    withEnv(
      {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service_role",
      },
      () => {
        const cfg = getConfig()
        expect(cfg.supabaseUrl).toBe("https://example.supabase.co")
        expect(cfg.supabaseServiceRoleKey).toBe("service_role")
        expect(cfg.jiraBoardId).toBe(null)
        expect(cfg.jiraJql).toBe(null)
        expect(cfg.jiraSyncEnabled).toBe(false)
        expect(cfg.supabaseIssuesTable).toBe("sheet_issues_raw")
        expect(cfg.supabaseIssuesNormalizedTable).toBe("issues_normalized")
        expect(cfg.supabaseIssueSprintsTable).toBe("issue_sprints")
        expect(cfg.supabaseSprintMetricsTable).toBe("sprint_metrics")
        expect(cfg.supabaseScopeChangesTable).toBe("sprint_scope_changes")
        expect(cfg.supabaseSyncStateTable).toBe("sync_state")
        expect(cfg.supabaseSprintsTable).toBe("sprints")
      },
    )
  })
})
