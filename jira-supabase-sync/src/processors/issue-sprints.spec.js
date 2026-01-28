import { describe, expect, it, vi } from "vitest"
import { parseSprintNames, syncIssueSprints } from "./issue-sprints.js"

describe("parseSprintNames", () => {
  it("parses arrays or strings removing brackets", () => {
    expect(parseSprintNames(["Sprint 1", "Sprint 2"])).toEqual(["Sprint 1", "Sprint 2"])
    expect(parseSprintNames("[Sprint A, Sprint B]")).toEqual(["Sprint A", "Sprint B"])
    expect(parseSprintNames("Sprint A; Sprint B")).toEqual(["Sprint A", "Sprint B"])
    expect(parseSprintNames(null)).toEqual([])
  })
})

describe("syncIssueSprints", () => {
  it("upserts current associations and marks removed ones", async () => {
    const rows = [
      { key: "ISSUE-1", sprint: "S1", status: "Done", story_point_estimate: 5 },
      { key: "ISSUE-2", sprint: "S2", status: "To Do", story_point_estimate: 3 },
    ]

    const upsertSpy = vi.fn().mockResolvedValue({ error: null })
    const updateSpy = vi.fn().mockResolvedValue({ error: null })
    const selectSpy = vi.fn().mockResolvedValue({
      data: [{ id: "old", issue_key: "ISSUE-1", sprint_name: "S3", is_removed: false }],
      error: null,
    })

    const supabase = {
      from: vi.fn(() => ({
        select: () => ({
          in: selectSpy,
        }),
        upsert: upsertSpy,
        update: () => ({
          in: updateSpy,
        }),
      })),
    }

    const result = await syncIssueSprints({ supabase, rows, table: "issue_sprints" })

    expect(result.upserted).toBe(2)
    expect(result.markedRemoved).toBe(1)
    expect(upsertSpy).toHaveBeenCalled()
    expect(updateSpy).toHaveBeenCalled()
  })
})
