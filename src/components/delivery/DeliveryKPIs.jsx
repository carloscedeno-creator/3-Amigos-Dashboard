import { useEffect, useState } from "react"
import { Activity, AlertCircle, Gauge, Loader2, PackageCheck, Timer } from "lucide-react"
import { KPICard } from "../common/KPICard"
import { DeliveryKPIFilters } from "./DeliveryKPIFilters"
import { DeliveryScoreChart } from "./DeliveryScoreChart"
import { ComponentBreakdownChart } from "./ComponentBreakdownChart"
import { fetchDeliveryMetrics, getDeliveryProjects } from "../../services/deliveryKPIService"

// Sample scenarios removed; data now comes from Supabase.

const trendVsTarget = (value, target, direction = "higher") => {
  if (target === undefined || target === null) return "neutral"
  const higherIsBetter = direction === "higher"
  if (higherIsBetter) {
    if (value >= target) return "up"
    if (value >= target * 0.9) return "neutral"
    return "down"
  }
  // lower is better
  if (value <= target) return "up"
  if (value <= target * 1.1) return "neutral"
  return "down"
}

const formatValue = (value, decimals = 1) => {
  if (value === undefined || value === null) return "0"
  return Number(value).toFixed(decimals)
}

export function DeliveryKPIs() {
  const [filters, setFilters] = useState({ squad: "all", sprint: "all", range: "recent" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    delivery: { value: 0, target: null },
    velocity: { value: 0, target: null },
    cycleTime: { value: 0, target: null },
    throughput: { value: 0, target: null },
  })
  const [history, setHistory] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [projectOptions, setProjectOptions] = useState([{ value: "all", label: "All squads" }])
  const [sprintOptions, setSprintOptions] = useState([{ value: "all", label: "All sprints" }])
  const [rawData, setRawData] = useState({ sprints: [], history: [] })

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        const projects = await getDeliveryProjects()
        const options = [{ value: "all", label: "All squads" }, ...projects.map((p) => ({ value: p, label: p })) ]
        setProjectOptions(options)
      } catch (err) {
        setError(err?.message || "Unable to load projects")
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchDeliveryMetrics({ project: filters.squad })
        const sprintOpts = [
          { value: "all", label: "All sprints" },
          ...(data.sprints || []).map((s) => {
            const end = s.end_date || s.updated_at
            const label = end ? `${s.sprint_name} (${new Date(end).toLocaleDateString()})` : s.sprint_name
            return { value: s.sprint_name, label }
          }),
        ]
        setSprintOptions(sprintOpts)
        setRawData({ sprints: data.sprints || [], history: data.history || [], cycleTime: data.cycleTime })
        // compute overall defaults
        setMetrics({
          delivery: { value: data.deliveryScore, target: null },
          velocity: { value: data.velocity, target: null },
          cycleTime: { value: data.cycleTime, target: null },
          throughput: { value: data.throughput, target: null },
        })
        setHistory(data.history || [])
        setBreakdown([
          { metric: "Velocity (SP)", actual: data.velocity, target: null },
          { metric: "Cycle Time (days)", actual: data.cycleTime, target: null },
          { metric: "Throughput (issues)", actual: data.throughput, target: null },
        ])
      } catch (loadError) {
        setError(loadError?.message || "Unable to load delivery metrics.")
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [filters.squad])

  // Derive displayed metrics based on selected sprint/range
  useEffect(() => {
    if (!rawData) return
    const { sprints = [], history: allHistory = [], cycleTime } = rawData

    const findSprint = sprints.find((s) => s.sprint_name === filters.sprint)
    if (findSprint && filters.sprint !== "all") {
      const total = Number(findSprint.metrics?.sp_total ?? 0)
      const done = Number(findSprint.metrics?.sp_done ?? 0)
      const issuesDone = Number(findSprint.metrics?.issues_done ?? 0)
      const deliveryScore = total > 0 ? Math.min(100, Math.max(0, Math.round((done / total) * 100))) : 0

      setMetrics({
        delivery: { value: deliveryScore, target: null },
        velocity: { value: done, target: null },
        cycleTime: { value: cycleTime ?? 0, target: null },
        throughput: { value: issuesDone, target: null },
      })
      setHistory([{ name: findSprint.sprint_name, score: deliveryScore, target: null }])
      setBreakdown([
        { metric: "Velocity (SP)", actual: done, target: null },
        { metric: "Cycle Time (days)", actual: cycleTime ?? 0, target: null },
        { metric: "Throughput (issues)", actual: issuesDone, target: null },
      ])
      return
    }

    // All sprints view
    let trimmedHistory = allHistory
    if (filters.range === "last-4") trimmedHistory = allHistory.slice(-4)
    if (filters.range === "last-6") trimmedHistory = allHistory.slice(-6)

    setHistory(trimmedHistory)
    // Metrics were set during fetch (overall averages) and remain valid here.
    setBreakdown([
      { metric: "Velocity (SP)", actual: metrics.velocity.value, target: metrics.velocity.target },
      { metric: "Cycle Time (days)", actual: metrics.cycleTime.value, target: metrics.cycleTime.target },
      { metric: "Throughput (issues)", actual: metrics.throughput.value, target: metrics.throughput.target },
    ])
  }, [filters.sprint, filters.range, rawData, metrics.velocity.value, metrics.cycleTime.value, metrics.throughput.value])

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-700">Loading delivery metrics…</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Delivery metrics unavailable
        </div>
        <p className="mt-1 text-sm">{error}</p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-primary-600">Module 5 · Delivery Metrics</p>
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-2xl font-bold text-slate-900">Delivery KPIs</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {projectOptions.find((o) => o.value === filters.squad)?.label || "All squads"}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Delivery Success Score y componentes (velocity, cycle time, throughput) con datos reales de Supabase.
        </p>
      </header>

      <DeliveryKPIFilters
        filters={filters}
        onChange={setFilters}
        squadOptions={projectOptions}
        sprintOptions={sprintOptions}
        rangeOptions={[{ value: "recent", label: "Recent sprints" }, { value: "last-4", label: "Last 4" }, { value: "last-6", label: "Last 6" }]}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Delivery Success Score"
          value={formatValue(metrics.delivery.value)}
          label="/100"
          trend={trendVsTarget(metrics.delivery.value, metrics.delivery.target, "higher")}
          color="primary"
          icon={Gauge}
          tooltip="Average delivery score vs target"
        >
          {metrics.delivery.target ? `Target ${metrics.delivery.target}` : "Sin target"}
        </KPICard>

        <KPICard
          title="Velocity"
          value={formatValue(metrics.velocity.value)}
          label="SP avg"
          trend={trendVsTarget(metrics.velocity.value, metrics.velocity.target, "higher")}
          color="success"
          icon={Activity}
          tooltip="Average velocity (story points)"
        >
          {metrics.velocity.target ? `Target ${metrics.velocity.target} SP` : "Sin target"}
        </KPICard>

        <KPICard
          title="Cycle Time"
          value={formatValue(metrics.cycleTime.value)}
          label="days"
          trend={trendVsTarget(metrics.cycleTime.value, metrics.cycleTime.target, "lower")}
          color="warning"
          icon={Timer}
          tooltip="Average days from start to completion"
        >
          {metrics.cycleTime.target ? `Target ${metrics.cycleTime.target} days` : "Sin target"}
        </KPICard>

        <KPICard
          title="Throughput"
          value={formatValue(metrics.throughput.value)}
          label="issues/sprint"
          trend={trendVsTarget(metrics.throughput.value, metrics.throughput.target, "higher")}
          color="muted"
          icon={PackageCheck}
          tooltip="Average completed issues per sprint"
        >
          {metrics.throughput.target ? `Target ${metrics.throughput.target}` : "Sin target"}
        </KPICard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Delivery Score history</p>
              <p className="text-xs text-slate-500">Trend across recent sprints with target line</p>
            </div>
          </div>
          <DeliveryScoreChart data={history} target={80} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Component breakdown</p>
              <p className="text-xs text-slate-500">Actual vs target per component</p>
            </div>
          </div>
          <ComponentBreakdownChart data={breakdown} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <p>Datos desde Supabase (sprint_metrics, issues_normalized). Sin mocks.</p>
      </div>
    </section>
  )
}
