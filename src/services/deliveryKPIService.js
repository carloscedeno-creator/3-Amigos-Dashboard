const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

const cacheStore = new Map()

const buildCacheKey = (metric, { squadId, sprintId, dateRange }) =>
  `${metric}:${squadId || "all"}:${sprintId || "all"}:${dateRange || "all"}`

const clamp = (value) => {
  if (Number.isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

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

const average = (numbers) => {
  const valid = numbers.filter((n) => Number.isFinite(n))
  if (!valid.length) return 0
  return valid.reduce((sum, n) => sum + n, 0) / valid.length
}

const defaultFetchers = {
  delivery: async () => [78, 82, 75],
  velocity: async () => [32, 35, 30],
  cycleTime: async () => [6.2, 7.1, 5.9],
  throughput: async () => [14, 12, 16],
}

const resolveMetrics = async (fetcher) => {
  if (typeof fetcher === "function") {
    return fetcher()
  }
  return fetcher
}

const buildMetric = async ({ fetcher, clamp100 = true, cacheKey, forceRefresh = false, ttlMs = DEFAULT_TTL_MS }) => {
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return { value: cached, cached: true }
  }

  const data = await resolveMetrics(fetcher)
  const values = Array.isArray(data) ? data.filter((n) => Number.isFinite(n)) : []
  const val = clamp100 ? clamp(average(values)) : average(values)

  const stored = setCached(cacheKey, val, ttlMs)
  return { value: stored, cached: false }
}

/**
 * Delivery Success Score (0-100)
 */
export async function getDeliveryScore({ squadId, sprintId, dateRange, fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("deliveryScore", { squadId, sprintId, dateRange })
  return buildMetric({
    metric: "deliveryScore",
    fetcher: fetchMetrics || defaultFetchers.delivery,
    cacheKey,
    forceRefresh,
    ttlMs,
  })
}

/**
 * Velocity (story points) - returns numeric average (not clamped to 0-100).
 */
export async function getVelocity({ squadId, sprintId, dateRange, fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("velocity", { squadId, sprintId, dateRange })
  return buildMetric({
    metric: "velocity",
    fetcher: fetchMetrics || defaultFetchers.velocity,
    cacheKey,
    forceRefresh,
    ttlMs,
    clamp100: false,
  })
}

/**
 * Cycle Time (days) - average days to complete.
 */
export async function getCycleTime({ squadId, sprintId, dateRange, fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("cycleTime", { squadId, sprintId, dateRange })
  return buildMetric({
    metric: "cycleTime",
    fetcher: fetchMetrics || defaultFetchers.cycleTime,
    cacheKey,
    forceRefresh,
    ttlMs,
    clamp100: false,
  })
}

/**
 * Throughput (issues/story points per period).
 */
export async function getThroughput({ squadId, sprintId, dateRange, fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = {}) {
  const cacheKey = buildCacheKey("throughput", { squadId, sprintId, dateRange })
  return buildMetric({
    metric: "throughput",
    fetcher: fetchMetrics || defaultFetchers.throughput,
    cacheKey,
    forceRefresh,
    ttlMs,
    clamp100: false,
  })
}

export function clearDeliveryCache() {
  cacheStore.clear()
}

export const __testables = {
  cacheStore,
  getCached,
  setCached,
  clamp,
  average,
  buildCacheKey,
}
