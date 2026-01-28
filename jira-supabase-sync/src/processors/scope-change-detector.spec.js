import { describe, expect, it, vi } from "vitest"
import { detectScopeChanges } from "./scope-change-detector.js"

function makeSupabase({ existing = [], failSelect = false, failInsert = false }) {
  const selects = []
  const inserts = []
  return {
    selects,
    inserts,
    supabase: {
      from: () => ({
        select: () => ({
          in: vi
            .fn()
            .mockResolvedValue(failSelect ? { error: new Error("boom") } : { data: existing, error: null }),
        }),
        insert: vi.fn(async (rows) => {
          inserts.push(...rows)
          if (failInsert) return { error: new Error("insert fail") }
          return { error: null }
        }),
      }),
    },
    insertsRef: inserts,
  }
}

describe("detectScopeChanges", () => {
  it("detects added, removed, and story point change", async () => {
    const rows = [
      { key: "ISSUE-1", sprint: "S1", story_point_estimate: 5, status: "To Do" },
      { key: "ISSUE-2", sprint: "S2", story_point_estimate: 3, status: "Done" },
    ]

    const existing = [
      { issue_key: "ISSUE-1", sprint_name: "S1", story_points_at_sync: 2, status_at_sync: "To Do", is_removed: false },
      { issue_key: "ISSUE-3", sprint_name: "S3", story_points_at_sync: 1, status_at_sync: "To Do", is_removed: false },
    ]

    const { supabase, insertsRef } = makeSupabase({ existing })

    const result = await detectScopeChanges({
      supabase,
      rows,
      issueSprintsTable: "issue_sprints",
      scopeChangesTable: "sprint_scope_changes",
    })

    expect(result.inserted).toBe(3)
    const changeTypes = insertsRef.map((r) => r.change_type).sort()
    expect(changeTypes).toEqual(["added", "removed", "story_points_changed"])
  })
})
