import { AlertCircle, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useMemo } from "react"

const SAMPLE_ALERTS = [
  {
    id: "AL-1",
    type: "velocity",
    title: "Low velocity in A-Team",
    description: "Velocity is 62% of goal for current sprint.",
    severity: "warning",
    link: "/projects",
  },
  {
    id: "AL-2",
    type: "blocked",
    title: "Blocked issues detected",
    description: "3 issues blocked for more than 2 days.",
    severity: "danger",
    link: "/projects",
  },
  {
    id: "AL-3",
    type: "closing-soon",
    title: "Sprint closing soon",
    description: "Sprint Beta ends in 2 days.",
    severity: "warning",
    link: "/projects",
  },
  {
    id: "AL-4",
    type: "info",
    title: "All squads healthy",
    description: "No critical alerts detected.",
    severity: "info",
    link: "/overall",
  },
]

const SEVERITY_STYLES = {
  danger: {
    icon: AlertCircle,
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    pill: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    pill: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  info: {
    icon: Clock,
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  success: {
    icon: CheckCircle,
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
}

const typeLabel = {
  velocity: "Low velocity",
  blocked: "Blocked issues",
  "closing-soon": "Sprint closing soon",
  info: "Info",
}

export function QuickAlerts({ alerts = SAMPLE_ALERTS }) {
  const summary = useMemo(() => {
    const counts = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      },
      { danger: 0, warning: 0, info: 0, success: 0 },
    )
    return counts
  }, [alerts])

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quick Alerts</h2>
          <p className="text-sm text-slate-600">Sprints at risk, blocked issues, and closing soon</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">Danger {summary.danger}</span>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">Warning {summary.warning}</span>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Info {summary.info}</span>
        </div>
      </header>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          No alerts at this time.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((alert) => {
            const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
            const Icon = style.icon
            return (
              <article
                key={alert.id}
                className={`flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.badge}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-600">{typeLabel[alert.type] || "Alert"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${style.pill}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{alert.description}</p>
                {alert.link ? (
                  <a className="text-sm font-semibold text-primary-700 hover:text-primary-800" href={alert.link}>
                    View details →
                  </a>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
