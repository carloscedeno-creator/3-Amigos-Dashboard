const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

const cacheStore = new Map()

const clampScore = (value) => {
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

const buildAverageScore = async ({ cacheKey, fetchMetrics, forceRefresh, ttlMs = DEFAULT_TTL_MS }) => {
  if (!forceRefresh) {
    const cached = getCached(cacheKey)
    if (cached) return { ...cached, cached: true }
  }

  const metricsSource = typeof fetchMetrics === "function" ? await fetchMetrics() : fetchMetrics
  const scores = Array.isArray(metricsSource) ? metricsSource.filter((n) => Number.isFinite(n)) : []

  const total = scores.reduce((sum, n) => sum + n, 0)
  const average = scores.length ? clampScore(total / scores.length) : 0

  const result = setCached(cacheKey, { score: average, sampleCount: scores.length }, ttlMs)

  return { ...result, cached: false }
}

/**
 * Calculate average Delivery Success Score across squads.
 * @param {Object} [options]
 * @param {() => Promise<number[]>|number[]} [options.fetchMetrics] async or sync provider of per-squad scores
 * @param {boolean} [options.forceRefresh=false] bypass cache
 * @param {number} [options.ttlMs=DEFAULT_TTL_MS] cache TTL
 * @returns {Promise<{score:number, sampleCount:number, cached:boolean}>}
 */
export async function getDeliverySuccessScore(options = {}) {
  const { fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = options
  return buildAverageScore({
    cacheKey: "overallView:deliverySuccessScore",
    fetchMetrics,
    forceRefresh,
    ttlMs,
  })
}

/**
 * Calculate average Quality Score (0-100) across squads.
 */
export async function getQualityScore(options = {}) {
  const { fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = options
  return buildAverageScore({
    cacheKey: "overallView:qualityScore",
    fetchMetrics,
    forceRefresh,
    ttlMs,
  })
}

/**
 * Calculate average Team Health Score (0-100) across squads.
 */
export async function getTeamHealthScore(options = {}) {
  const { fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = options
  return buildAverageScore({
    cacheKey: "overallView:teamHealthScore",
    fetchMetrics,
    forceRefresh,
    ttlMs,
  })
}

/**
 * Calculate average Velocity (0-100 normalized) across squads.
 * Consumers can normalize velocity before passing or provide raw numbers
 * already scaled to 0-100.
 */
export async function getAverageVelocity(options = {}) {
  const { fetchMetrics, forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = options
  return buildAverageScore({
    cacheKey: "overallView:averageVelocity",
    fetchMetrics,
    forceRefresh,
    ttlMs,
  })
}

/**
 * Clear cached overall view entries (used by tests or manual refresh).
 */
export function clearOverallViewCache() {
  cacheStore.clear()
}

export const __testables = {
  clampScore,
  getCached,
  setCached,
  cacheStore,
  buildAverageScore,
}
