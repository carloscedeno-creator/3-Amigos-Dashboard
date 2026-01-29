import { getSupabaseClient } from "@/utils/supabaseApi"

const DEFAULT_LIMIT = 100

/**
 * Fetch active sprint snapshots from Supabase.
 * It combines `sprint_metrics` (progress data) with `sprints` (dates).
 */
export async function fetchActiveSprints({ limit = DEFAULT_LIMIT } = {}) {
  const supabase = getSupabaseClient()

  const { data: metricsRows, error: metricsError } = await supabase
    .from("sprint_metrics")
    .select("sprint_name, metrics, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (metricsError) {
    throw new Error(`No se pudo leer sprint_metrics: ${metricsError.message}`)
  }

  const sprintNames = (metricsRows || []).map((row) => row.sprint_name).filter(Boolean)
  let sprintsData = []

  if (sprintNames.length) {
    const { data, error } = await supabase
      .from("sprints")
      .select("name, start_date, end_date, complete_date, state, last_seen_at")
      .in("name", sprintNames)

    if (error) {
      // Dates are helpful but not blocking; log-friendly error and continue.
      // eslint-disable-next-line no-console
      console.warn("fetchActiveSprints: fallo leyendo sprints", error.message)
    } else {
      sprintsData = data || []
    }
  }

  const sprintIndex = new Map(sprintsData.map((s) => [s.name, s]))

  // Build sprint → projects map using issue_sprints + issues_normalized
  const sprintNamesSet = new Set(metricsRows.map((row) => row.sprint_name).filter(Boolean))
  let sprintProjects = new Map()

  if (sprintNamesSet.size) {
    const sprintNames = Array.from(sprintNamesSet)
    // Fetch issue_sprints for these sprint names
    const { data: issueSprintRows, error: issueSprintError } = await supabase
      .from("issue_sprints")
      .select("issue_key, sprint_name, is_removed")
      .in("sprint_name", sprintNames)
      .eq("is_removed", false)

    if (issueSprintError) {
      // eslint-disable-next-line no-console
      console.warn("fetchActiveSprints: fallo leyendo issue_sprints", issueSprintError.message)
    } else {
      const issueKeys = Array.from(new Set(issueSprintRows.map((r) => r.issue_key).filter(Boolean)))
      let issueProjects = new Map()

      if (issueKeys.length) {
        const { data: issuesRows, error: issuesError } = await supabase
          .from("issues_normalized")
          .select("key, project")
          .in("key", issueKeys)

        if (issuesError) {
          // eslint-disable-next-line no-console
          console.warn("fetchActiveSprints: fallo leyendo issues_normalized", issuesError.message)
        } else {
          issueProjects = new Map(issuesRows.map((r) => [r.key, r.project || "Unknown"]))
        }
      }

      sprintProjects = issueSprintRows.reduce((map, row) => {
        const proj = issueProjects.get(row.issue_key)
        if (!proj) return map
        const set = map.get(row.sprint_name) || new Set()
        set.add(proj)
        map.set(row.sprint_name, set)
        return map
      }, new Map())
    }
  }

  return (metricsRows || [])
    .filter((row) => {
      const metrics = row.metrics || {}
      const total = Number(metrics.sp_total ?? 0)
      const done = Number(metrics.sp_done ?? 0)
      return total > 0 || done > 0
    })
    .map((row) => {
      const sprint = sprintIndex.get(row.sprint_name) || {}
      const metrics = row.metrics || {}
      const projectsSet = sprintProjects.get(row.sprint_name) || new Set()
      const projects = Array.from(projectsSet).filter(Boolean)
      const endDate = sprint.end_date || null
      const startDate = sprint.start_date || null
      const completeDate = sprint.complete_date || null
      const state = sprint.state || null
      // Fallback to last_seen_at as a soft recency marker when no dates are present.
      const recency = sprint.last_seen_at || row.updated_at

      return {
        id: row.sprint_name,
        name: row.sprint_name,
        squad: projects[0] || metrics.squad || "Unknown",
        projects,
        spGoal: metrics.sp_total ?? 0,
        spDone: metrics.sp_done ?? 0,
        startDate,
        endDate,
        completeDate,
        state,
        updatedAt: row.updated_at,
        recency,
      }
    })
}
