import { queryWithRetry } from "@/utils/supabaseApi"

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes
const VIEW_NAME = "v_developer_sprint_metrics_complete"

const cacheStore = new Map()

const buildCacheKey = (key, { squadId = "all", sprintId = "latest", developerId = "all" } = {}) =>
  `${key}:${squadId}:${sprintId}:${developerId}`

const getCached = (key) => {
  const entry = cacheStore.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    cacheStore.delete(key)
    return null
  }
  return entry.value
}

const setCached = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

const clamp = (value) => {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

const getNumber = (row, keys, fallback = 0) => {
  if (!row) return fallback
  for (const key of keys) {
    const val = row[key]
    if (Number.isFinite(val)) return val
  }
  return fallback
}

const mapIssue = (issue = {}) => ({
  key: issue.key || issue.issue_key || "",
  title: issue.title || issue.summary || "",
  status: issue.status || issue.state || "Unknown",
  storyPoints: getNumber(issue, ["storyPoints", "story_points", "sp"]),
  cycleTimeDays: getNumber(issue, ["cycleTimeDays", "cycle_time_days", "cycle_time"]),
  type: issue.type || issue.issue_type || "Story",
  updatedAt: issue.updatedAt || issue.updated_at || issue.changedAt || issue.created_at || null,
})

const mapMetricRow = (row = {}) => ({
  developerId: row.developer_id || row.developerId || "",
  developerName: row.developer_name || row.developerName || "Unknown developer",
  squadId: row.squad_id || row.squadId || "",
  sprintId: row.sprint_id || row.sprintId || "",
  sprintName: row.sprint_name || row.sprintName || row.sprint_id || "",
  doneRate: clamp(getNumber(row, ["dev_done_rate", "done_rate", "completion_rate"])),
  storyPointsCompleted: getNumber(row, ["story_points_completed", "completed_sp", "sp_completed"]),
  issuesCompleted: getNumber(row, ["issues_completed", "completed_issues"]),
  averageCycleTimeDays: getNumber(row, ["avg_cycle_time_days", "average_cycle_time", "cycle_time_days"]),
  throughput: getNumber(row, ["throughput", "issues_per_sprint", "sp_per_sprint"]),
  burndown: Array.isArray(row.burndown) ? row.burndown : [],
  issues: Array.isArray(row.issues) ? row.issues.map(mapIssue) : [],
})

const MOCK_DEVELOPERS = {
  alpha: [
    { id: "dev-anna", name: "Anna Park" },
    { id: "dev-lee", name: "Lee Johnson" },
    { id: "dev-ruiz", name: "Mariana Ruiz" },
  ],
  bravo: [
    { id: "dev-omar", name: "Omar Singh" },
    { id: "dev-cam", name: "Cam Nguyen" },
  ],
  gamma: [
    { id: "dev-sara", name: "Sara Ito" },
    { id: "dev-jake", name: "Jake Fowler" },
  ],
}

const MOCK_METRICS = [
  {
    developerId: "dev-anna",
    developerName: "Anna Park",
    squadId: "alpha",
    sprintId: "S-15",
    sprintName: "Sprint 15",
    doneRate: 88,
    storyPointsCompleted: 34,
    issuesCompleted: 12,
    averageCycleTimeDays: 4.2,
    throughput: 11,
    burndown: [
      { day: "Day 1", spRemaining: 42, spIdeal: 42 },
      { day: "Day 5", spRemaining: 30, spIdeal: 32 },
      { day: "Day 10", spRemaining: 14, spIdeal: 22 },
      { day: "Day 14", spRemaining: 6, spIdeal: 0 },
    ],
    issues: [
      { key: "ALPHA-310", title: "Improve caching", status: "Done", storyPoints: 5, cycleTimeDays: 3 },
      { key: "ALPHA-311", title: "Fix flaky tests", status: "In Progress", storyPoints: 3, cycleTimeDays: 5 },
      { key: "ALPHA-312", title: "Refactor burndown", status: "Done", storyPoints: 5, cycleTimeDays: 4 },
    ],
  },
  {
    developerId: "dev-lee",
    developerName: "Lee Johnson",
    squadId: "alpha",
    sprintId: "S-15",
    sprintName: "Sprint 15",
    doneRate: 74,
    storyPointsCompleted: 26,
    issuesCompleted: 10,
    averageCycleTimeDays: 5.1,
    throughput: 9,
    burndown: [
      { day: "Day 1", spRemaining: 36, spIdeal: 36 },
      { day: "Day 5", spRemaining: 28, spIdeal: 27 },
      { day: "Day 10", spRemaining: 15, spIdeal: 18 },
      { day: "Day 14", spRemaining: 8, spIdeal: 0 },
    ],
    issues: [
      { key: "ALPHA-320", title: "Auth cleanup", status: "Done", storyPoints: 3, cycleTimeDays: 4 },
      { key: "ALPHA-321", title: "Chart polish", status: "To Do", storyPoints: 2, cycleTimeDays: 0 },
      { key: "ALPHA-322", title: "Accessibility fixes", status: "In Progress", storyPoints: 3, cycleTimeDays: 6 },
    ],
  },
  {
    developerId: "dev-omar",
    developerName: "Omar Singh",
    squadId: "bravo",
    sprintId: "S-15",
    sprintName: "Sprint 15",
    doneRate: 82,
    storyPointsCompleted: 29,
    issuesCompleted: 11,
    averageCycleTimeDays: 4.8,
    throughput: 10,
    burndown: [
      { day: "Day 1", spRemaining: 38, spIdeal: 38 },
      { day: "Day 5", spRemaining: 25, spIdeal: 29 },
      { day: "Day 10", spRemaining: 12, spIdeal: 19 },
      { day: "Day 14", spRemaining: 5, spIdeal: 0 },
    ],
    issues: [
      { key: "BRAVO-410", title: "Mobile layout", status: "Done", storyPoints: 5, cycleTimeDays: 3 },
      { key: "BRAVO-411", title: "Error boundaries", status: "Blocked", storyPoints: 3, cycleTimeDays: 0 },
      { key: "BRAVO-412", title: "Data table", status: "Done", storyPoints: 4, cycleTimeDays: 5 },
    ],
  },
  {
    developerId: "dev-sara",
    developerName: "Sara Ito",
    squadId: "gamma",
    sprintId: "S-15",
    sprintName: "Sprint 15",
    doneRate: 91,
    storyPointsCompleted: 26,
    issuesCompleted: 9,
    averageCycleTimeDays: 3.7,
    throughput: 8,
    burndown: [
      { day: "Day 1", spRemaining: 28, spIdeal: 28 },
      { day: "Day 5", spRemaining: 20, spIdeal: 21 },
      { day: "Day 10", spRemaining: 9, spIdeal: 14 },
      { day: "Day 14", spRemaining: 2, spIdeal: 0 },
    ],
    issues: [
      { key: "GAMMA-510", title: "CI hardening", status: "Done", storyPoints: 3, cycleTimeDays: 2 },
      { key: "GAMMA-511", title: "A11y sweep", status: "Done", storyPoints: 3, cycleTimeDays: 4 },
      { key: "GAMMA-512", title: "Feature flags", status: "In Progress", storyPoints: 4, cycleTimeDays: 6 },
    ],
  },
]

const getMockDevelopers = (squadId) => {
  if (squadId && squadId !== "all") return MOCK_DEVELOPERS[squadId] || []
  return Object.values(MOCK_DEVELOPERS).flat()
}

const findMockMetrics = ({ squadId, sprintId, developerId }) => {
  const filtered = MOCK_METRICS.filter((row) => {
    const squadMatches = !squadId || squadId === "all" || row.squadId === squadId
    const sprintMatches = !sprintId || sprintId === "latest" || row.sprintId === sprintId
    const devMatches = !developerId || developerId === "all" || row.developerId === developerId
    return squadMatches && sprintMatches && devMatches
  })
  if (developerId && filtered.length) return filtered[0]
  return filtered
}

const findMockIssues = (params) => {
  const match = findMockMetrics(params)
  if (Array.isArray(match)) {
    return match.flatMap((entry) => entry.issues || [])
  }
  return match?.issues || []
}

export async function getDevelopersBySquad(
  squadId,
  { forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {},
) {
  const cacheKey = buildCacheKey("developers", { squadId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  try {
    const { data } = await queryWithRetry((client) => {
      let query = client.from(VIEW_NAME).select("developer_id, developer_name, squad_id").order("developer_name", {
        ascending: true,
      })
      if (squadId && squadId !== "all") {
        query = query.eq("squad_id", squadId)
      }
      return query
    })

    const developers =
      data?.map((row) => ({
        id: row.developer_id,
        name: row.developer_name,
        squadId: row.squad_id,
      })) || []

    if (developers.length) {
      return setCached(cacheKey, developers, ttlMs)
    }
  } catch (error) {
    console.warn("Falling back to mock developers:", error?.message)
  }

  return setCached(cacheKey, getMockDevelopers(squadId), ttlMs)
}

export async function getDeveloperMetrics({
  squadId,
  sprintId,
  developerId,
  forceRefresh = false,
  ttlMs = DEFAULT_TTL_MS,
} = {}) {
  const cacheKey = buildCacheKey("developerMetrics", { squadId, sprintId, developerId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  try {
    const { data } = await queryWithRetry((client) => {
      let query = client.from(VIEW_NAME).select("*")
      if (squadId && squadId !== "all") query = query.eq("squad_id", squadId)
      if (sprintId && sprintId !== "latest") query = query.eq("sprint_id", sprintId)
      if (developerId && developerId !== "all") query = query.eq("developer_id", developerId)
      return query
    })

    const mapped = (data || []).map(mapMetricRow)
    if (developerId && developerId !== "all") {
      const match = mapped.find((row) => row.developerId === developerId) || mapped[0] || null
      if (match) return setCached(cacheKey, match, ttlMs)
    }
    if (mapped.length) return setCached(cacheKey, mapped, ttlMs)
  } catch (error) {
    console.warn("Falling back to mock developer metrics:", error?.message)
  }

  const fallback = findMockMetrics({ squadId, sprintId, developerId }) || null
  return setCached(cacheKey, fallback, ttlMs)
}

export async function getDeveloperIssues({
  squadId,
  sprintId,
  developerId,
  forceRefresh = false,
  ttlMs = DEFAULT_TTL_MS,
} = {}) {
  const cacheKey = buildCacheKey("developerIssues", { squadId, sprintId, developerId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  try {
    const { data } = await queryWithRetry((client) => {
      let query = client.from(VIEW_NAME).select("developer_id, issues, squad_id, sprint_id")
      if (squadId && squadId !== "all") query = query.eq("squad_id", squadId)
      if (sprintId && sprintId !== "latest") query = query.eq("sprint_id", sprintId)
      if (developerId && developerId !== "all") query = query.eq("developer_id", developerId)
      return query
    })

    const issues =
      data
        ?.flatMap((row) => (Array.isArray(row.issues) ? row.issues.map(mapIssue) : []))
        ?.filter(Boolean) || []

    if (issues.length) return setCached(cacheKey, issues, ttlMs)
  } catch (error) {
    console.warn("Falling back to mock developer issues:", error?.message)
  }

  return setCached(cacheKey, findMockIssues({ squadId, sprintId, developerId }), ttlMs)
}

export function clearDeveloperMetricsCache() {
  cacheStore.clear()
}

export const __testables = {
  cacheStore,
  buildCacheKey,
  getCached,
  setCached,
  clamp,
  getNumber,
  mapMetricRow,
  mapIssue,
  findMockMetrics,
}
