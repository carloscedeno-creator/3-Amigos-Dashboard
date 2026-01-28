import { useEffect, useMemo, useRef, useState } from "react"
import { Activity, AlertCircle, Download, Gauge, Layers, Loader2, Shuffle, Target } from "lucide-react"
import { KPICard } from "@/components/common/KPICard"
import { BoardStateBreakdown } from "./BoardStateBreakdown"
import { ScopeChangesList } from "./ScopeChangesList"
import {
  getScopeChanges,
  getSprintIssues,
  getSprintMetrics,
  getSprintsBySquad,
  getSquads,
} from "@/services/projectMetricsApi"
import { generateSprintPDF } from "@/utils/pdfGenerator"

const statusCopy = {
  header: "Module 6 · Projects Metrics",
  title: "Projects Metrics",
  description: "Sprint-level metrics, board state breakdown, scope changes, and exportable PDF snapshot.",
}

const formatNumber = (value, decimals = 0) => {
  if (value === undefined || value === null) return "0"
  const fixed = Number(value).toFixed(decimals)
  return decimals === 0 ? fixed : Number(fixed).toLocaleString(undefined, { minimumFractionDigits: decimals })
}

const deriveTrend = (value, target) => {
  if (target === undefined || target === null) return "neutral"
  if (value >= target) return "up"
  if (value >= target * 0.9) return "neutral"
  return "down"
}

export function ProjectsMetrics() {
  const [squads, setSquads] = useState([])
  const [sprints, setSprints] = useState([])
  const [filters, setFilters] = useState({ squadId: "", sprintId: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [issues, setIssues] = useState([])
  const [scopeChanges, setScopeChanges] = useState({ added: [], removed: [], changed: [] })
  const reportRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const loadSquads = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getSquads()
        setSquads(data)
        const firstSquad = data?.[0]?.id || ""
        setFilters((prev) => ({ ...prev, squadId: prev.squadId || firstSquad }))
      } catch (loadError) {
        setError(loadError?.message || "Unable to load squads.")
        setLoading(false)
      }
    }
    loadSquads()
  }, [])

  useEffect(() => {
    const loadSprints = async () => {
      if (!filters.squadId) return
      setLoading(true)
      setError(null)
      try {
        const sprintList = await getSprintsBySquad(filters.squadId)
        setSprints(sprintList)
        const firstSprint = sprintList?.[0]?.id || ""
        setFilters((prev) => ({ ...prev, sprintId: prev.sprintId || firstSprint }))
      } catch (loadError) {
        setError(loadError?.message || "Unable to load sprints.")
        setLoading(false)
      }
    }
    loadSprints()
  }, [filters.squadId])

  useEffect(() => {
    const loadData = async () => {
      if (!filters.squadId || !filters.sprintId) return
      setLoading(true)
      setError(null)
      try {
        const [metricsData, issuesData, scopeData] = await Promise.all([
          getSprintMetrics({ squadId: filters.squadId, sprintId: filters.sprintId }),
          getSprintIssues({ squadId: filters.squadId, sprintId: filters.sprintId }),
          getScopeChanges({ squadId: filters.squadId, sprintId: filters.sprintId }),
        ])
        setMetrics(metricsData)
        setIssues(issuesData)
        setScopeChanges(scopeData)
      } catch (loadError) {
        setError(loadError?.message || "Unable to load projects metrics.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [filters.squadId, filters.sprintId])

  const handleExport = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      await generateSprintPDF({
        element: reportRef.current,
        fileName: `${filters.sprintId || "sprint"}-projects.pdf`,
        meta: {
          module: "Projects Metrics",
          squad: squads.find((s) => s.id === filters.squadId)?.name || filters.squadId,
          sprint: filters.sprintId,
        },
        excludeSelectors: ["[data-export-ignore]"],
        scale: 1.6,
      })
    } catch (exportError) {
      setError(exportError?.message || "Unable to export PDF.")
    } finally {
      setExporting(false)
    }
  }

  const squadOptions = useMemo(
    () => squads.map((squad) => ({ value: squad.id, label: squad.name })),
    [squads],
  )
  const sprintOptions = useMemo(
    () => sprints.map((sprint) => ({ value: sprint.id, label: sprint.name })),
    [sprints],
  )

  if (loading && !metrics) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">Loading project metrics…</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Projects metrics unavailable
        </div>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="space-y-4 px-1 sm:px-2" ref={reportRef}>
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{statusCopy.header}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{statusCopy.title}</h2>
            <p className="text-sm text-slate-600">{statusCopy.description}</p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            data-export-ignore
            className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export PDF
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Squad</label>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
            value={filters.squadId}
            data-export-ignore
            onChange={(e) => setFilters({ sprintId: "", squadId: e.target.value })}
          >
            {squadOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Sprint</label>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
            value={filters.sprintId}
            data-export-ignore
            onChange={(e) => setFilters((prev) => ({ ...prev, sprintId: e.target.value }))}
          >
            {sprintOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <div
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
            data-export-ignore
          >
            <p>
              Data uses mocked samples and client-side caching (5 minutes) via <code>projectMetricsApi</code>. Replace
              fetchers with Supabase RPCs when backend is ready.
            </p>
          </div>
        </div>
      </div>

      {metrics && (
        <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="SP Done vs Goal"
            value={formatNumber(metrics.spDone)}
            label={`/ ${formatNumber(metrics.spGoal)} SP`}
            trend={deriveTrend(metrics.spDone, metrics.spGoal)}
            color="primary"
            icon={Target}
            tooltip="Committed vs completed story points"
          >
            {formatNumber(metrics.completionPct, 0)}% complete
          </KPICard>
          <KPICard
            title="Velocity"
            value={formatNumber(metrics.velocity, 1)}
            label="SP"
            trend="neutral"
            color="success"
            icon={Activity}
            tooltip="Average velocity for the sprint"
          >
            Includes carryover adjustments
          </KPICard>
          <KPICard
            title="Scope Added"
            value={`+${formatNumber(metrics.scopeAdded)}`}
            label="SP added"
            trend="down"
            color="warning"
            icon={Layers}
            tooltip="Story points added after commitment"
          >
            Removed {formatNumber(metrics.scopeRemoved)} SP
          </KPICard>
          <KPICard
            title="Scope Net Change"
            value={formatNumber(metrics.scopeNet)}
            label="SP"
            trend={metrics.scopeNet > 0 ? "down" : metrics.scopeNet < 0 ? "up" : "neutral"}
            color="muted"
            icon={Shuffle}
            tooltip="Added - removed + changed story points"
          >
            Scope changed {formatNumber(metrics.scopeChanged)} SP
          </KPICard>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Board State breakdown</p>
              <p className="text-xs text-slate-500">Done vs In Progress vs To Do vs Blocked</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {filters.sprintId}
            </span>
          </div>
          <BoardStateBreakdown issues={issues} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Scope changes</p>
              <p className="text-xs text-slate-500">Added, removed, and SP deltas</p>
            </div>
          </div>
          <ScopeChangesList changes={scopeChanges} />
        </div>
      </div>
    </section>
  )
}
