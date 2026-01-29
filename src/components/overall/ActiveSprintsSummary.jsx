import { useEffect, useMemo, useState } from "react"
import { Clock, Flag, Gauge, Info, ShieldAlert } from "lucide-react"
import { fetchActiveSprints } from "@/services/sprintService"

/** @typedef {import("./types").ActiveSprintsSummaryProps} ActiveSprintsSummaryProps */

const daysRemaining = (endDate) => {
  if (!endDate) return 0
  const today = new Date()
  const end = new Date(endDate)
  const diffMs = end.getTime() - today.setHours(0, 0, 0, 0)
  if (Number.isNaN(diffMs)) return 0
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

const progressPercent = (done, goal) => {
  if (!goal || goal <= 0) return 0
  const pct = (done / goal) * 100
  if (Number.isNaN(pct)) return 0
  return Math.min(200, Math.max(0, Math.round(pct)))
}

/**
 * Lists active sprints with progress, days remaining and risk highlighting.
 * Data rules:
 * - Source: Supabase (`sprint_metrics` + `sprints`), enriched with projects from `issue_sprints`→`issues_normalized`.
 * - Only sprints with SP data (sp_total or sp_done > 0).
 * - Hide sprints ended in the past (endDate < today).
 * - Hide sprints older than ~90 days (by endDate or recency/last_seen_at).
 */
export function ActiveSprintsSummary({ initialSquad }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sprints, setSprints] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await fetchActiveSprints()
        setSprints(rows || [])
      } catch (err) {
        setError(err?.message || "No se pudo cargar sprints")
        setSprints([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const activeSprints = useMemo(() => {
    const todayMidnight = new Date().setHours(0, 0, 0, 0)
    const cutoffMs = (() => {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })()

    return (sprints || [])
      .filter((s) => {
        const end = s.endDate ? new Date(s.endDate) : null
        const endMs = end && !Number.isNaN(end.getTime()) ? end.getTime() : null
        const recencyMs = s.recency ? new Date(s.recency).getTime() : null
        const state = (s.state || "").toLowerCase()
        const hasProject = (s.projects || []).some((p) => p && p.toLowerCase() !== "unknown")

        // Require end date and at least one known project.
        if (!endMs) return false
        if (!hasProject) return false

        // Drop if older than 90 days by end date or recency marker.
        if (endMs && endMs < cutoffMs) return false
        if (!endMs && recencyMs && recencyMs < cutoffMs) return false

        // Hide ended sprints (end date in the past).
        if (endMs && endMs < todayMidnight) return false

        // Prefer active/in-progress; allow planned with future end date; drop closed.
        if (state === "closed" || state === "complete") return false

        return true
      })
      .sort((a, b) => {
        // Sort by nearest end date, then recency
        const aEnd = a.endDate ? new Date(a.endDate).getTime() : Infinity
        const bEnd = b.endDate ? new Date(b.endDate).getTime() : Infinity
        if (aEnd !== bEnd) return aEnd - bEnd
        const aTime = a.recency ? new Date(a.recency).getTime() : 0
        const bTime = b.recency ? new Date(b.recency).getTime() : 0
        return bTime - aTime
      })
  }, [sprints])

  const squads = useMemo(() => {
    const unique = new Set(activeSprints.map((s) => s.squad))
    return ["All", ...Array.from(unique)]
  }, [activeSprints])

  const [selectedSquad, setSelectedSquad] = useState(initialSquad && squads.includes(initialSquad) ? initialSquad : "All")

  const filtered = selectedSquad === "All" ? activeSprints : activeSprints.filter((s) => s.squad === selectedSquad)

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Sprints</h2>
          <p className="text-sm text-slate-600">Progress and risk at a glance</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span>Squad</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm"
            value={selectedSquad}
            onChange={(e) => setSelectedSquad(e.target.value)}
          >
            {squads.map((squad) => (
              <option key={squad} value={squad}>
                {squad}
              </option>
            ))}
          </select>
        </label>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-primary-500" aria-hidden />
          Loading sprints...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Info className="h-4 w-4 text-slate-400" />
          No active sprints found for this squad.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((sprint) => {
            const pct = progressPercent(sprint.spDone, sprint.spGoal)
            const remaining = daysRemaining(sprint.endDate)
            const atRisk = pct < 70
            const nearEnd = remaining <= 3
            const projectsLabel = (sprint.projects || []).join(", ")
            const stateLabel = sprint.state || "Active"
            const statusColor = atRisk ? "text-rose-700 bg-rose-50 ring-rose-100" : "text-emerald-700 bg-emerald-50 ring-emerald-100"

            return (
              <article
                key={sprint.id}
                className={`rounded-xl border ${atRisk ? "border-rose-200" : "border-slate-200"} bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sprint.squad}</p>
                    <h3 className="text-lg font-bold text-slate-900">{sprint.name}</h3>
                    <p className="text-xs text-slate-500">
                      {sprint.endDate ? `Ends ${new Date(sprint.endDate).toLocaleDateString()}` : "No end date"}
                    </p>
                    {projectsLabel && <p className="text-[11px] text-slate-500">Projects: {projectsLabel}</p>}
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusColor} ring-2`}>
                    {atRisk ? <ShieldAlert className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                    {stateLabel}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-primary-600" />
                      Progress
                    </span>
                    <span>
                      {sprint.spDone} / {sprint.spGoal} SP ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${atRisk ? "bg-rose-500" : "bg-primary-500"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      Days remaining
                    </span>
                    <span className={nearEnd ? "font-semibold text-rose-700" : "font-semibold"}>
                      {remaining >= 0 ? `${remaining} days` : "Ended"}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
