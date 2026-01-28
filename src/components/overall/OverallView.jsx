import { useEffect, useMemo, useState } from "react"
import { Activity, Gauge, HeartPulse, ShieldCheck } from "lucide-react"
import { KPICard } from "../common/KPICard"
import {
  getAverageVelocity,
  getDeliverySuccessScore,
  getQualityScore,
  getTeamHealthScore,
} from "../../services/overallViewService"

/** @typedef {import("./types").OverallViewProps} OverallViewProps */

const DEFAULT_SAMPLE = {
  delivery: [82, 76, 91],
  quality: [78, 80, 74],
  health: [72, 69, 75],
  velocity: [68, 72, 70],
}

const trendFor = (value) => {
  if (value >= 75) return "up"
  if (value >= 50) return "neutral"
  return "down"
}

/**
 * Overall dashboard view with four KPI cards.
 * @param {OverallViewProps} props
 */
export function OverallView({
  fetchDeliveryScores,
  fetchQualityScores,
  fetchTeamHealthScores,
  fetchVelocityScores,
}) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    delivery: { score: 0, cached: false, sampleCount: 0 },
    quality: { score: 0, cached: false, sampleCount: 0 },
    health: { score: 0, cached: false, sampleCount: 0 },
    velocity: { score: 0, cached: false, sampleCount: 0 },
  })

  const fetchers = useMemo(
    () => ({
      delivery: fetchDeliveryScores || (() => DEFAULT_SAMPLE.delivery),
      quality: fetchQualityScores || (() => DEFAULT_SAMPLE.quality),
      health: fetchTeamHealthScores || (() => DEFAULT_SAMPLE.health),
      velocity: fetchVelocityScores || (() => DEFAULT_SAMPLE.velocity),
    }),
    [fetchDeliveryScores, fetchQualityScores, fetchTeamHealthScores, fetchVelocityScores],
  )

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true)
      try {
        const [delivery, quality, health, velocity] = await Promise.all([
          getDeliverySuccessScore({ fetchMetrics: fetchers.delivery }),
          getQualityScore({ fetchMetrics: fetchers.quality }),
          getTeamHealthScore({ fetchMetrics: fetchers.health }),
          getAverageVelocity({ fetchMetrics: fetchers.velocity }),
        ])

        setMetrics({
          delivery,
          quality,
          health,
          velocity,
        })
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [fetchers])

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-primary-500" aria-hidden />
          <p className="text-sm font-medium text-slate-600">Loading overall metrics…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Overall View</h2>
        <p className="text-sm text-slate-600">Key KPIs across squads</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <KPICard
          title="Delivery Success Score"
          value={`${metrics.delivery.score}`}
          label="%"
          trend={trendFor(metrics.delivery.score)}
          color="primary"
          icon={Gauge}
          tooltip="Average delivery score across squads"
        />

        <KPICard
          title="Quality Score"
          value={`${metrics.quality.score}`}
          label="%"
          trend={trendFor(metrics.quality.score)}
          color="success"
          icon={ShieldCheck}
          tooltip="Average quality score across squads"
        />

        <KPICard
          title="Team Health Score"
          value={`${metrics.health.score}`}
          label="%"
          trend={trendFor(metrics.health.score)}
          color="warning"
          icon={HeartPulse}
          tooltip="Average team health score across squads"
        />

        <KPICard
          title="Average Velocity"
          value={`${metrics.velocity.score}`}
          label="%"
          trend={trendFor(metrics.velocity.score)}
          color="muted"
          icon={Activity}
          tooltip="Normalized average velocity across squads"
        />
      </div>
    </section>
  )
}
