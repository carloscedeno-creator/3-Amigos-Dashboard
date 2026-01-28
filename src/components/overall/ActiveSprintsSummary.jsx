import { useMemo, useState } from "react"
import { Clock, Flag, Gauge, Info, ShieldAlert } from "lucide-react"

/** @typedef {import("./types").ActiveSprintsSummaryProps} ActiveSprintsSummaryProps */

const SAMPLE_SPRINTS = [
  {
    id: "SPR-101",
    name: "Sprint Alpha",
    squad: "A-Team",
    spGoal: 80,
    spDone: 52,
    startDate: "2026-01-15",
    endDate: "2026-01-30",
  },
  {
    id: "SPR-102",
    name: "Sprint Beta",
    squad: "B-Team",
    spGoal: 60,
    spDone: 28,
    startDate: "2026-01-18",
    endDate: "2026-02-01",
  },
  {
    id: "SPR-103",
    name: "Sprint Gamma",
    squad: "A-Team",
    spGoal: 70,
    spDone: 69,
    startDate: "2026-01-10",
    endDate: "2026-01-24",
  },
]

const daysRemaining = (endDate) => {
  const today = new Date()
  const end = new Date(endDate)
  const diffMs = end.getTime() - today.setHours(0, 0, 0, 0)
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
 * @param {ActiveSprintsSummaryProps} props
 */
export function ActiveSprintsSummary({ sprints = SAMPLE_SPRINTS, initialSquad }) {
  const squads = useMemo(() => {
    const unique = new Set(sprints.map((s) => s.squad))
    return ["All", ...Array.from(unique)]
  }, [sprints])

  const [selectedSquad, setSelectedSquad] = useState(initialSquad && squads.includes(initialSquad) ? initialSquad : "All")

  const filtered = selectedSquad === "All" ? sprints : sprints.filter((s) => s.squad === selectedSquad)

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

      {filtered.length === 0 ? (
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
                    <p className="text-xs text-slate-500">Ends {new Date(sprint.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusColor} ring-2`}>
                    {atRisk ? <ShieldAlert className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                    {atRisk ? "At Risk" : "On Track"}
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
