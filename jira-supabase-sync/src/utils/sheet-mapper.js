const DIRECT_MAP = {
  "Issue Type": "issue_type",
  Key: "key",
  Summary: "summary",
  "Epic Name": "epic_name",
  Project: "project",
  "Project.name": "project_name",
  Assignee: "assignee",
  Priority: "priority",
  Status: "status",
  "Story point estimate": "story_point_estimate",
  Sprint: "sprint",
  "Sprint.name": "sprint_name",
  "Sprint.startDate": "sprint_start_date",
  "Sprint.endDate": "sprint_end_date",
  "Sprint.completeDate": "sprint_complete_date",
  "Sprint.state": "sprint_state",
  "PO Approved": "po_approved",
  "Actual end": "actual_end",
  Resolved: "resolved",
  "Product Approved ": "product_approved",
  "Product Approver": "product_approver",
  Comments: "comments",
  Components: "components",
  "Contributors.accountId": "contributors_account_id",
  "Contributors.accountType": "contributors_account_type",
  "Contributors.displayName": "contributors_display_name",
  Created: "created",
  "Creator.accountId": "creator_account_id",
  "Creator.displayName": "creator_display_name",
  Description: "description",
  Environment: "environment",
  "End Date": "end_date",
  "Issue ID": "issue_id",
  parent: "parent",
  "Parent Link": "parent_link",
  "PR for QA": "pr_for_qa",
  "PR for Staging": "pr_for_staging",
  "Project ID": "project_id",
  "QA Approved": "qa_approved",
  "Release Notes Description": "release_notes_description",
  Resolution: "resolution",
  "Story Points": "story_points",
}

const DUPLICATE_GROUPS = {
  story_point_estimate_qa: [
    "Story Point estimate (QA)",
    "Story Point estimate (QA)",
    "Story point estimate (QA)",
  ],
  story_point_estimate_dev: ["Story point estimate (DEV)", "Story point estimate (DEV)"],
  start_date: ["Start date", "Start Date "],
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  const text = String(value).trim()
  if (!text) return true
  return text === "[no field found]"
}

function getValueFromGroup({ header, row, candidates }) {
  for (const col of candidates) {
    const idx = header.indexOf(col)
    if (idx === -1) continue
    const value = row[idx]
    if (!isEmpty(value)) {
      return value
    }
  }
  return undefined
}

function mapRow({ header, row }) {
  const mapped = {}

  // Direct, non-duplicated columns
  for (const [source, target] of Object.entries(DIRECT_MAP)) {
    const idx = header.indexOf(source)
    if (idx === -1) continue
    const value = row[idx]
    if (!isEmpty(value)) {
      mapped[target] = value
    }
  }

  // Groups with duplicates or variants
  for (const [target, sources] of Object.entries(DUPLICATE_GROUPS)) {
    const value = getValueFromGroup({ header, row, candidates: sources })
    if (!isEmpty(value)) {
      mapped[target] = value
    }
  }

  return mapped
}

export function mapSheetRows({ header, rows }) {
  if (!Array.isArray(header) || !Array.isArray(rows)) {
    throw new Error("mapSheetRows: header and rows must be arrays")
  }
  return rows.map((row) => mapRow({ header, row }))
}

export function buildHeaderIndex(header) {
  return header.reduce((acc, col, idx) => {
    acc[col] = idx
    return acc
  }, {})
}

export const SHEET_HEADER_MAP = {
  direct: DIRECT_MAP,
  groups: DUPLICATE_GROUPS,
}
