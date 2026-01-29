import { getSupabaseClient } from "@/utils/supabaseApi"

const DEFAULT_LIMIT = 12

const clamp100 = (value) => {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

const average = (numbers) => {
  const valid = numbers.filter((n) => Number.isFinite(n))
  if (!valid.length) return 0
  return valid.reduce((sum, n) => sum + n, 0) / valid.length
}

const normalizeProject = (name) => (name || "").trim().toLowerCase()

function filterByProject(rows, project) {
  if (!project || project === "all") return rows
  const target = normalizeProject(project)
  return rows.filter((row) => {
    const projects = row.metrics?.projects || []
    return projects.some((p) => normalizeProject(p) === target)
  })
}

export async function getDeliveryProjects() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("sprint_metrics").select("metrics").limit(200)
  if (error) {
    throw new Error(`No se pudo leer sprint_metrics: ${error.message}`)
  }
  const set = new Set()
  for (const row of data || []) {
    for (const p of row.metrics?.projects || []) {
      const normalized = normalizeProject(p)
      if (normalized && normalized !== "unknown") {
        set.add(p.trim())
      }
    }
  }
  return Array.from(set)
}

export async function fetchDeliveryMetrics({ project = "all", limit = DEFAULT_LIMIT } = {}) {
  const supabase = getSupabaseClient()

  // Sprint-level metrics
  const { data: metricsRows, error: metricsError } = await supabase
    .from("sprint_metrics")
    .select("sprint_name, metrics, updated_at")
    .order("updated_at", { ascending: false })
    .limit(150)

  if (metricsError) {
    throw new Error(`No se pudo leer sprint_metrics: ${metricsError.message}`)
  }

  // Fetch sprint dates/state to support ordering
  const sprintNames = Array.from(new Set((metricsRows || []).map((r) => r.sprint_name).filter(Boolean)))
  let sprintsMeta = []
  if (sprintNames.length) {
    const { data: sData, error: sError } = await supabase
      .from("sprints")
      .select("name, start_date, end_date, complete_date, state, last_seen_at")
      .in("name", sprintNames)
    if (!sError && sData) {
      sprintsMeta = sData
    }
  }
  const sprintIndex = new Map(sprintsMeta.map((s) => [s.name, s]))

  const withDates = (metricsRows || []).map((row) => {
    const meta = sprintIndex.get(row.sprint_name) || {}
    return {
      ...row,
      start_date: meta.start_date || null,
      end_date: meta.end_date || null,
      complete_date: meta.complete_date || null,
      state: meta.state || null,
      last_seen_at: meta.last_seen_at || row.updated_at,
    }
  })

  const filtered = filterByProject(withDates, project)
    .filter((row) => {
      const total = Number(row.metrics?.sp_total ?? 0)
      const done = Number(row.metrics?.sp_done ?? 0)
      return total > 0 || done > 0
    })
    .sort((a, b) => {
      const aEnd = a.end_date ? new Date(a.end_date).getTime() : -Infinity
      const bEnd = b.end_date ? new Date(b.end_date).getTime() : -Infinity
      if (bEnd !== aEnd) return bEnd - aEnd
      const aUpd = new Date(a.updated_at || 0).getTime()
      const bUpd = new Date(b.updated_at || 0).getTime()
      return bUpd - aUpd
    })
    .slice(0, limit)

  const completionScores = filtered.map((row) => {
    const total = Number(row.metrics?.sp_total ?? 0)
    const done = Number(row.metrics?.sp_done ?? 0)
    return total > 0 ? clamp100((done / total) * 100) : 0
  })

  const velocityValues = filtered.map((row) => Number(row.metrics?.sp_done ?? 0))
  const throughputValues = filtered.map((row) => Number(row.metrics?.issues_done ?? 0))

  const history = filtered.map((row, idx) => ({
    name: row.sprint_name || `Sprint ${filtered.length - idx}`,
    score: completionScores[idx] ?? 0,
    target: null,
  }))

  // Cycle time from issues_normalized (resolved vs created)
  const { data: issues, error: issuesError } = await supabase
    .from("issues_normalized")
    .select("created_at, resolved, project")
    .not("resolved", "is", null)
    .order("resolved", { ascending: false })
    .limit(300)

  if (issuesError) {
    throw new Error(`No se pudo leer issues_normalized: ${issuesError.message}`)
  }

  const filteredIssues =
    project && project !== "all"
      ? issues.filter((row) => normalizeProject(row.project) === normalizeProject(project))
      : issues

  const cycleTimes = filteredIssues
    .map((row) => {
      const created = row.created_at ? new Date(row.created_at).getTime() : null
      const resolved = row.resolved ? new Date(row.resolved).getTime() : null
      if (!created || !resolved || Number.isNaN(created) || Number.isNaN(resolved)) return null
      const days = (resolved - created) / (1000 * 60 * 60 * 24)
      return days >= 0 ? days : null
    })
    .filter((n) => Number.isFinite(n))

  const deliveryScore = clamp100(average(completionScores))
  const velocity = average(velocityValues)
  const throughput = average(throughputValues)
  const cycleTime = average(cycleTimes)

  return {
    deliveryScore,
    velocity,
    throughput,
    cycleTime,
    history,
    sprints: filtered,
  }
}
