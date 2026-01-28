const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

const cacheStore = new Map()

const buildCacheKey = (key, { squadId = "all", sprintId = "latest" } = {}) => `${key}:${squadId}:${sprintId}`

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
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

const MOCK_SQUADS = [
  { id: "alpha", name: "Alpha Squad" },
  { id: "bravo", name: "Bravo Squad" },
  { id: "gamma", name: "Gamma Squad" },
]

const MOCK_SPRINTS = {
  alpha: [
    {
      id: "S-15",
      name: "Sprint 15",
      startDate: "2026-01-10",
      endDate: "2026-01-24",
      goalSp: 42,
      doneSp: 38,
      velocity: 36,
      scope: { added: 8, removed: 3, changed: 5 },
      issues: [
        { key: "ALPHA-120", title: "Implement auth callbacks", status: "Done", storyPoints: 8 },
        { key: "ALPHA-121", title: "Improve velocity chart", status: "Done", storyPoints: 5 },
        { key: "ALPHA-122", title: "Optimize DB indexes", status: "In Progress", storyPoints: 5 },
        { key: "ALPHA-123", title: "Fix flaky tests", status: "In Progress", storyPoints: 3 },
        { key: "ALPHA-124", title: "Add API pagination", status: "To Do", storyPoints: 5 },
        { key: "ALPHA-125", title: "Resolve blockers", status: "Blocked", storyPoints: 2 },
        { key: "ALPHA-126", title: "QA regression", status: "Done", storyPoints: 5 },
        { key: "ALPHA-127", title: "Improve logging", status: "To Do", storyPoints: 3 },
      ],
      scopeChanges: {
        added: [
          { key: "ALPHA-130", title: "Enable feature flags", storyPoints: 3, changedAt: "2026-01-15" },
          { key: "ALPHA-131", title: "Hotfix auth redirect", storyPoints: 2, changedAt: "2026-01-17" },
        ],
        removed: [{ key: "ALPHA-090", title: "Deprecated endpoint cleanup", storyPoints: 5, changedAt: "2026-01-12" }],
        changed: [{ key: "ALPHA-115", title: "Expand reporting scope", delta: +3, changedAt: "2026-01-18" }],
      },
    },
    {
      id: "S-14",
      name: "Sprint 14",
      startDate: "2025-12-27",
      endDate: "2026-01-09",
      goalSp: 40,
      doneSp: 34,
      velocity: 33,
      scope: { added: 6, removed: 2, changed: 2 },
      issues: [
        { key: "ALPHA-110", title: "Dashboard layout", status: "Done", storyPoints: 8 },
        { key: "ALPHA-111", title: "Sidebar polish", status: "Done", storyPoints: 5 },
        { key: "ALPHA-112", title: "Cache layer", status: "Done", storyPoints: 5 },
        { key: "ALPHA-113", title: "Build pipeline", status: "In Progress", storyPoints: 3 },
        { key: "ALPHA-114", title: "Docs update", status: "To Do", storyPoints: 2 },
      ],
      scopeChanges: {
        added: [{ key: "ALPHA-116", title: "Telemetry MVP", storyPoints: 3, changedAt: "2026-01-02" }],
        removed: [],
        changed: [{ key: "ALPHA-108", title: "Auth refinements", delta: +2, changedAt: "2026-01-05" }],
      },
    },
  ],
  bravo: [
    {
      id: "S-15",
      name: "Sprint 15",
      startDate: "2026-01-10",
      endDate: "2026-01-24",
      goalSp: 38,
      doneSp: 30,
      velocity: 29,
      scope: { added: 10, removed: 4, changed: 6 },
      issues: [
        { key: "BRAVO-201", title: "Mobile layout fixes", status: "Done", storyPoints: 5 },
        { key: "BRAVO-202", title: "Improve caching", status: "In Progress", storyPoints: 5 },
        { key: "BRAVO-203", title: "Error boundaries", status: "To Do", storyPoints: 3 },
        { key: "BRAVO-204", title: "Graph tuning", status: "Blocked", storyPoints: 3 },
        { key: "BRAVO-205", title: "QA pass", status: "Done", storyPoints: 5 },
      ],
      scopeChanges: {
        added: [{ key: "BRAVO-210", title: "New sprint widget", storyPoints: 5, changedAt: "2026-01-16" }],
        removed: [{ key: "BRAVO-180", title: "Remove legacy chart", storyPoints: 3, changedAt: "2026-01-14" }],
        changed: [{ key: "BRAVO-190", title: "Performance work", delta: +4, changedAt: "2026-01-18" }],
      },
    },
  ],
  gamma: [
    {
      id: "S-15",
      name: "Sprint 15",
      startDate: "2026-01-10",
      endDate: "2026-01-24",
      goalSp: 28,
      doneSp: 26,
      velocity: 24,
      scope: { added: 4, removed: 1, changed: 2 },
      issues: [
        { key: "GAMMA-70", title: "CI hardening", status: "Done", storyPoints: 3 },
        { key: "GAMMA-71", title: "Accessibility sweep", status: "In Progress", storyPoints: 5 },
        { key: "GAMMA-72", title: "Docs refresh", status: "Done", storyPoints: 3 },
        { key: "GAMMA-73", title: "Feature flag cleanup", status: "To Do", storyPoints: 2 },
      ],
      scopeChanges: {
        added: [{ key: "GAMMA-75", title: "Pipeline metrics", storyPoints: 2, changedAt: "2026-01-12" }],
        removed: [],
        changed: [{ key: "GAMMA-60", title: "SDK update", delta: +1, changedAt: "2026-01-15" }],
      },
    },
  ],
}

const FALLBACK_SPRINT = {
  id: "S-latest",
  name: "Current sprint",
  startDate: "",
  endDate: "",
  goalSp: 0,
  doneSp: 0,
  velocity: 0,
  scope: { added: 0, removed: 0, changed: 0 },
  issues: [],
  scopeChanges: { added: [], removed: [], changed: [] },
}

const findSprint = (squadId, sprintId) => {
  const list = MOCK_SPRINTS[squadId] || []
  if (!list.length) return FALLBACK_SPRINT
  if (!sprintId) return list[0]
  return list.find((s) => s.id === sprintId) || list[0]
}

export async function getSquads({ forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("squads")
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }
  return setCached(cacheKey, MOCK_SQUADS, ttlMs)
}

export async function getSprintsBySquad(squadId, { forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("sprints", { squadId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }
  const sprints = MOCK_SPRINTS[squadId] || []
  return setCached(
    cacheKey,
    sprints.map(({ id, name, startDate, endDate }) => ({ id, name, startDate, endDate })),
    ttlMs,
  )
}

export async function getSprintMetrics({ squadId, sprintId, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("sprintMetrics", { squadId, sprintId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }
  const sprint = findSprint(squadId, sprintId)
  const completionPct = sprint.goalSp ? clamp((sprint.doneSp / sprint.goalSp) * 100) : 0
  const scopeNet = sprint.scope.added - sprint.scope.removed + sprint.scope.changed

  const metrics = {
    sprintName: sprint.name,
    spGoal: sprint.goalSp,
    spDone: sprint.doneSp,
    completionPct,
    velocity: sprint.velocity,
    scopeAdded: sprint.scope.added,
    scopeRemoved: sprint.scope.removed,
    scopeChanged: sprint.scope.changed,
    scopeNet,
  }

  return setCached(cacheKey, metrics, ttlMs)
}

export async function getSprintIssues({ squadId, sprintId, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("sprintIssues", { squadId, sprintId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  const sprint = findSprint(squadId, sprintId)
  return setCached(cacheKey, sprint.issues || [], ttlMs)
}

export async function getScopeChanges({ squadId, sprintId, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("scopeChanges", { squadId, sprintId })
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }
  const sprint = findSprint(squadId, sprintId)
  return setCached(
    cacheKey,
    sprint.scopeChanges || { added: [], removed: [], changed: [] },
    ttlMs,
  )
}

export function clearProjectsCache() {
  cacheStore.clear()
}

export const __testables = {
  cacheStore,
  getCached,
  setCached,
  buildCacheKey,
  clamp,
  findSprint,
}
