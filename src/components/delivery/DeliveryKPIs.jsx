import { useEffect, useMemo, useState } from "react"
import { Activity, AlertCircle, Gauge, Loader2, PackageCheck, Timer } from "lucide-react"
import { KPICard } from "../common/KPICard"
import { DeliveryKPIFilters } from "./DeliveryKPIFilters"
import { DeliveryScoreChart } from "./DeliveryScoreChart"
import { ComponentBreakdownChart } from "./ComponentBreakdownChart"
import { getCycleTime, getDeliveryScore, getThroughput, getVelocity } from "../../services/deliveryKPIService"

const SAMPLE_SCENARIOS = {
  all: {
    label: "All squads",
    targets: { delivery: 82, velocity: 36, cycleTime: 6, throughput: 16 },
    sprints: [
      {
        id: "current",
        label: "Current sprint",
        deliveryScores: [82, 79, 84],
        velocity: [34, 36, 35],
        cycleTime: [6.4, 6.1, 5.9],
        throughput: [15, 16, 15],
        history: [
          { name: "S-10", score: 68, target: 75 },
          { name: "S-11", score: 72, target: 75 },
          { name: "S-12", score: 77, target: 76 },
          { name: "S-13", score: 81, target: 78 },
          { name: "S-14", score: 79, target: 80 },
          { name: "S-15", score: 84, target: 82 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 35, target: 36 },
          { metric: "Cycle Time (days)", actual: 6.1, target: 6 },
          { metric: "Throughput (issues)", actual: 15, target: 16 },
        ],
      },
      {
        id: "previous",
        label: "Previous sprint",
        deliveryScores: [78, 80, 81],
        velocity: [33, 34, 35],
        cycleTime: [6.6, 6.3, 6.1],
        throughput: [13, 14, 15],
        history: [
          { name: "S-09", score: 65, target: 74 },
          { name: "S-10", score: 69, target: 74 },
          { name: "S-11", score: 72, target: 75 },
          { name: "S-12", score: 74, target: 76 },
          { name: "S-13", score: 77, target: 78 },
          { name: "S-14", score: 79, target: 79 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 34, target: 36 },
          { metric: "Cycle Time (days)", actual: 6.3, target: 6 },
          { metric: "Throughput (issues)", actual: 14, target: 16 },
        ],
      },
    ],
  },
  "a-team": {
    label: "A-Team",
    targets: { delivery: 85, velocity: 38, cycleTime: 5.8, throughput: 17 },
    sprints: [
      {
        id: "current",
        label: "Current sprint",
        deliveryScores: [86, 82, 88],
        velocity: [37, 38, 39],
        cycleTime: [5.9, 5.7, 5.8],
        throughput: [17, 18, 16],
        history: [
          { name: "S-10", score: 74, target: 78 },
          { name: "S-11", score: 79, target: 79 },
          { name: "S-12", score: 83, target: 80 },
          { name: "S-13", score: 85, target: 82 },
          { name: "S-14", score: 87, target: 84 },
          { name: "S-15", score: 86, target: 85 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 38, target: 38 },
          { metric: "Cycle Time (days)", actual: 5.8, target: 5.8 },
          { metric: "Throughput (issues)", actual: 17, target: 17 },
        ],
      },
      {
        id: "previous",
        label: "Previous sprint",
        deliveryScores: [80, 82, 81],
        velocity: [35, 36, 37],
        cycleTime: [6.1, 6, 5.9],
        throughput: [16, 17, 16],
        history: [
          { name: "S-09", score: 72, target: 77 },
          { name: "S-10", score: 74, target: 77 },
          { name: "S-11", score: 78, target: 78 },
          { name: "S-12", score: 80, target: 79 },
          { name: "S-13", score: 81, target: 80 },
          { name: "S-14", score: 83, target: 82 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 36, target: 38 },
          { metric: "Cycle Time (days)", actual: 6, target: 5.8 },
          { metric: "Throughput (issues)", actual: 16, target: 17 },
        ],
      },
    ],
  },
  "b-team": {
    label: "B-Team",
    targets: { delivery: 78, velocity: 34, cycleTime: 6.5, throughput: 14 },
    sprints: [
      {
        id: "current",
        label: "Current sprint",
        deliveryScores: [72, 76, 75],
        velocity: [30, 32, 33],
        cycleTime: [6.9, 6.7, 6.5],
        throughput: [12, 13, 13],
        history: [
          { name: "S-10", score: 60, target: 70 },
          { name: "S-11", score: 64, target: 71 },
          { name: "S-12", score: 69, target: 72 },
          { name: "S-13", score: 71, target: 74 },
          { name: "S-14", score: 73, target: 76 },
          { name: "S-15", score: 75, target: 78 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 32, target: 34 },
          { metric: "Cycle Time (days)", actual: 6.7, target: 6.5 },
          { metric: "Throughput (issues)", actual: 13, target: 14 },
        ],
      },
      {
        id: "previous",
        label: "Previous sprint",
        deliveryScores: [70, 71, 73],
        velocity: [29, 31, 32],
        cycleTime: [7.1, 6.9, 6.8],
        throughput: [11, 12, 12],
        history: [
          { name: "S-09", score: 58, target: 69 },
          { name: "S-10", score: 60, target: 69 },
          { name: "S-11", score: 63, target: 70 },
          { name: "S-12", score: 66, target: 71 },
          { name: "S-13", score: 68, target: 72 },
          { name: "S-14", score: 71, target: 73 },
        ],
        breakdown: [
          { metric: "Velocity (SP)", actual: 31, target: 34 },
          { metric: "Cycle Time (days)", actual: 6.9, target: 6.5 },
          { metric: "Throughput (issues)", actual: 12, target: 14 },
        ],
      },
    ],
  },
}

const RANGE_OPTIONS = [
  { value: "last-6", label: "Last 6 sprints" },
  { value: "last-4", label: "Last 4 sprints" },
  { value: "quarter", label: "Last quarter" },
]

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

const pickScenario = (filters) => {
  const scenario = SAMPLE_SCENARIOS[filters.squad] || SAMPLE_SCENARIOS.all
  const sprint = scenario.sprints.find((s) => s.id === filters.sprint) || scenario.sprints[0]
  return { scenario, sprint }
}

export function DeliveryKPIs() {
  const [filters, setFilters] = useState({ squad: "all", sprint: "current", range: "last-6" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    delivery: { value: 0, cached: false, target: 0 },
    velocity: { value: 0, cached: false, target: 0 },
    cycleTime: { value: 0, cached: false, target: 0 },
    throughput: { value: 0, cached: false, target: 0 },
  })
  const [history, setHistory] = useState([])
  const [breakdown, setBreakdown] = useState([])

  const squadOptions = useMemo(
    () =>
      Object.entries(SAMPLE_SCENARIOS).map(([key, info]) => ({
        value: key,
        label: info.label,
      })),
    [],
  )

  const sprintOptions = useMemo(() => {
    const { scenario } = pickScenario(filters)
    return scenario.sprints.map((sprint) => ({ value: sprint.id, label: sprint.label }))
  }, [filters])

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      setError(null)
      const { scenario, sprint } = pickScenario(filters)
      const trimmedHistory =
        filters.range === "last-4" ? sprint.history.slice(-4) : filters.range === "last-6" ? sprint.history.slice(-6) : sprint.history
      setHistory(trimmedHistory)
      setBreakdown(sprint.breakdown)

      try {
        const [delivery, velocity, cycleTime, throughput] = await Promise.all([
          getDeliveryScore({ fetchMetrics: () => sprint.deliveryScores }),
          getVelocity({ fetchMetrics: () => sprint.velocity }),
          getCycleTime({ fetchMetrics: () => sprint.cycleTime }),
          getThroughput({ fetchMetrics: () => sprint.throughput }),
        ])

        setMetrics({
          delivery: { ...delivery, target: scenario.targets.delivery },
          velocity: { ...velocity, target: scenario.targets.velocity },
          cycleTime: { ...cycleTime, target: scenario.targets.cycleTime },
          throughput: { ...throughput, target: scenario.targets.throughput },
        })
      } catch (loadError) {
        setError(loadError?.message || "Unable to load delivery metrics.")
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [filters])

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
            {filters.squad === "all" ? "All squads" : SAMPLE_SCENARIOS[filters.squad]?.label}
          </span>
        </div>
        <p className="text-sm text-slate-600">
          Delivery Success Score and component KPIs (velocity, cycle time, throughput) with historical trend and targets.
        </p>
      </header>

      <DeliveryKPIFilters
        filters={filters}
        onChange={setFilters}
        squadOptions={squadOptions}
        sprintOptions={sprintOptions}
        rangeOptions={RANGE_OPTIONS}
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
          Target {metrics.delivery.target}
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
          Target {metrics.velocity.target} SP
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
          Target {metrics.cycleTime.target} days
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
          Target {metrics.throughput.target}
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
          <DeliveryScoreChart data={history} target={SAMPLE_SCENARIOS[filters.squad]?.targets?.delivery || 80} />
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
        <p>
          Data uses mocked samples and client-side caching (5 minutes) via <code>deliveryKPIService</code>. Replace fetchers with Supabase RPCs
          when backend is ready.
        </p>
      </div>
    </section>
  )
}
