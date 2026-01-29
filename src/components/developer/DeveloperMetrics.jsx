import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Loader2,
  Target,
  TrendingUp,
  Users2,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { KPICard } from "@/components/common/KPICard"
import { getDeveloperIssues, getDeveloperMetrics, getDevelopersBySquad } from "@/services/developerMetricsApi"

const DEFAULT_SQUADS = [
  { value: "all", label: "All squads" },
  { value: "alpha", label: "Alpha" },
  { value: "bravo", label: "Bravo" },
  { value: "gamma", label: "Gamma" },
]

const DEFAULT_SPRINT_OPTIONS = [{ value: "latest", label: "Latest sprint" }]

const formatNumber = (value, decimals = 1) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "0"
  return Number(value).toFixed(decimals)
}

const aggregateMetrics = (rows = []) => {
  if (!rows.length) return null
  const doneRate =
    rows.reduce((acc, row) => acc + (Number.isFinite(row.doneRate) ? row.doneRate : 0), 0) / rows.length
  const storyPointsCompleted = rows.reduce(
    (acc, row) => acc + (Number.isFinite(row.storyPointsCompleted) ? row.storyPointsCompleted : 0),
    0,
  )
  const issuesCompleted = rows.reduce(
    (acc, row) => acc + (Number.isFinite(row.issuesCompleted) ? row.issuesCompleted : 0),
    0,
  )
  const averageCycleTimeDays =
    rows.reduce((acc, row) => acc + (Number.isFinite(row.averageCycleTimeDays) ? row.averageCycleTimeDays : 0), 0) /
    rows.length

  return {
    doneRate,
    storyPointsCompleted,
    issuesCompleted,
    averageCycleTimeDays,
  }
}

export function DeveloperMetrics() {
  const [filters, setFilters] = useState({ squad: "all", sprint: "latest", developer: "all" })
  const [developerOptions, setDeveloperOptions] = useState([{ value: "all", label: "All developers" }])
  const [sprintOptions, setSprintOptions] = useState(DEFAULT_SPRINT_OPTIONS)
  const [metrics, setMetrics] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        const devs = await getDevelopersBySquad(filters.squad)
        const options = [
          { value: "all", label: "All developers" },
          ...devs.map((d) => ({ value: d.id, label: d.name })),
        ]
        setDeveloperOptions(options)
        if (filters.developer !== "all" && !options.some((opt) => opt.value === filters.developer)) {
          setFilters((prev) => ({ ...prev, developer: "all" }))
        }
      } catch (loadErr) {
        setDeveloperOptions([{ value: "all", label: "All developers" }])
        setError(loadErr?.message || "Unable to load developers.")
      }
    }

    loadDevelopers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.squad])

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      setError(null)
      try {
        const [metricResult, issueResult] = await Promise.all([
          getDeveloperMetrics({
            squadId: filters.squad,
            sprintId: filters.sprint,
            developerId: filters.developer,
          }),
          getDeveloperIssues({
            squadId: filters.squad,
            sprintId: filters.sprint,
            developerId: filters.developer,
          }),
        ])

        const normalizedMetrics = Array.isArray(metricResult)
          ? metricResult.filter(Boolean)
          : metricResult
            ? [metricResult]
            : []

        setMetrics(normalizedMetrics)
        setIssues(issueResult || [])

        const sprintSet = new Map()
        normalizedMetrics.forEach((row) => {
          if (row?.sprintId) {
            sprintSet.set(row.sprintId, row.sprintName || row.sprintId)
          }
        })
        setSprintOptions(
          sprintSet.size
            ? [
                { value: "latest", label: "Latest sprint" },
                ...Array.from(sprintSet.entries()).map(([id, name]) => ({ value: id, label: name })),
              ]
            : DEFAULT_SPRINT_OPTIONS,
        )
      } catch (loadErr) {
        setError(loadErr?.message || "Unable to load developer metrics.")
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [filters])

  const selectedMetric = useMemo(() => {
    if (!metrics.length) return null
    if (filters.developer === "all") return metrics[0]
    return metrics.find((row) => row.developerId === filters.developer) || metrics[0]
  }, [metrics, filters.developer])

  const rollup = useMemo(() => aggregateMetrics(metrics), [metrics])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">Loading developer metrics…</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Developer metrics unavailable
        </div>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-primary-600">Module 7 · Developer Metrics</p>
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Developer Metrics</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {filters.squad === "all" ? "All squads" : filters.squad}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Per-developer delivery KPIs with burndown, workload, and recent issues. Data uses Supabase view{" "}
          <code>v_developer_sprint_metrics_complete</code> with cached fallback mocks.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Squad
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none"
            value={filters.squad}
            onChange={(e) => handleFilterChange("squad", e.target.value)}
          >
            {DEFAULT_SQUADS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Sprint
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none"
            value={filters.sprint}
            onChange={(e) => handleFilterChange("sprint", e.target.value)}
          >
            {sprintOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Developer
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none"
            value={filters.developer}
            onChange={(e) => handleFilterChange("developer", e.target.value)}
          >
            {developerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Cached for 5 minutes. Use filters to refine squad, sprint, and developer.
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Dev Done Rate"
          value={formatNumber(selectedMetric?.doneRate ?? rollup?.doneRate)}
          label="%"
          trend="neutral"
          color="primary"
          icon={Target}
          tooltip="Completed work rate for the selected developer or average."
        >
          {filters.developer === "all" ? "Avg of selected squad" : selectedMetric?.sprintName || "Current sprint"}
        </KPICard>

        <KPICard
          title="SP Completed"
          value={formatNumber(selectedMetric?.storyPointsCompleted ?? rollup?.storyPointsCompleted, 0)}
          label="story points"
          trend="neutral"
          color="success"
          icon={CheckCircle2}
          tooltip="Story points completed in the selected sprint."
        >
          Throughput {formatNumber(selectedMetric?.throughput ?? 0, 0)} issues/sprint
        </KPICard>

        <KPICard
          title="Issues Completed"
          value={formatNumber(selectedMetric?.issuesCompleted ?? rollup?.issuesCompleted, 0)}
          label="issues"
          trend="neutral"
          color="muted"
          icon={Users2}
          tooltip="Completed issues for the selected filters."
        >
          Squad scope {filters.squad === "all" ? "All" : filters.squad}
        </KPICard>

        <KPICard
          title="Avg Cycle Time"
          value={formatNumber(selectedMetric?.averageCycleTimeDays ?? rollup?.averageCycleTimeDays)}
          label="days"
          trend="neutral"
          color="warning"
          icon={Clock3}
          tooltip="Average days from start to completion."
        >
          Lower is better
        </KPICard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Done rate by developer</p>
              <p className="text-xs text-slate-500">Compare completion rates within the selected squad/sprint.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.map((row) => ({ name: row.developerName, doneRate: row.doneRate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
                <Bar dataKey="doneRate" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <ReferenceLine y={80} label="Target 80%" stroke="#0ea5e9" strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Burndown (selected developer)</p>
              <p className="text-xs text-slate-500">SP remaining vs ideal.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedMetric?.burndown || []} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
                <Line type="monotone" dataKey="spRemaining" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line
                  type="monotone"
                  dataKey="spIdeal"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Recent issues</p>
            <p className="text-xs text-slate-500">Filtered by squad, sprint, and developer.</p>
          </div>
          <Users2 className="h-5 w-5 text-primary-600" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Issue</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">SP</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Cycle Time (d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-center text-slate-600">
                    No issues for the selected filters.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.key}>
                    <td className="px-3 py-2 font-medium text-slate-900">{issue.key}</td>
                    <td className="px-3 py-2 text-slate-700">{issue.status}</td>
                    <td className="px-3 py-2 text-slate-700">{formatNumber(issue.storyPoints, 0)}</td>
                    <td className="px-3 py-2 text-slate-700">{formatNumber(issue.cycleTimeDays)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <p>
          Data comes from <code>developerMetricsApi</code>, querying Supabase view <code>{`v_developer_sprint_metrics_complete`}</code>
          with 5-minute caching and mock fallbacks while backend is wired.
        </p>
      </div>
    </section>
  )
}
