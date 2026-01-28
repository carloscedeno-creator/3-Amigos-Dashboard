import { useMemo } from "react"
import { CalendarDays } from "lucide-react"

/**
 * @typedef {import("../overall/types").TimelineItem} TimelineItem
 */

const DAY_MS = 1000 * 60 * 60 * 24

const toDate = (value) => new Date(value)

const diffDays = (a, b) => Math.max(0, Math.ceil((b.getTime() - a.getTime()) / DAY_MS))

const clamp = (n) => Math.min(100, Math.max(0, n))

/**
 * Simple Gantt-like chart rendered with CSS.
 * @param {{items: TimelineItem[]}} props
 */
export function GanttChart({ items = [] }) {
  const timeline = useMemo(() => {
    if (!items.length) return null
    const starts = items.map((i) => toDate(i.startDate))
    const ends = items.map((i) => toDate(i.endDate))

    const minStart = new Date(Math.min(...starts.map((d) => d.getTime())))
    const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())))
    const totalDays = Math.max(1, diffDays(minStart, maxEnd))

    const today = new Date()
    const todayPct = clamp((diffDays(minStart, today) / totalDays) * 100)

    const bars = items.map((item) => {
      const start = toDate(item.startDate)
      const end = toDate(item.endDate)
      const offset = clamp((diffDays(minStart, start) / totalDays) * 100)
      const width = clamp((diffDays(start, end) / totalDays) * 100)
      return { ...item, offset, width }
    })

    return { minStart, maxEnd, todayPct, bars }
  }, [items])

  if (!timeline) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        No timeline data available.
      </div>
    )
  }

  const { minStart, maxEnd, todayPct, bars } = timeline

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[640px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{minStart.toLocaleDateString()}</span>
          <span>{maxEnd.toLocaleDateString()}</span>
        </div>

        <div className="relative mt-4 h-12 rounded-lg bg-slate-50">
          <div
            className="absolute inset-y-0 w-0.5 bg-primary-500"
            style={{ left: `${todayPct}%` }}
            aria-label="Today"
            title="Today"
          />
          {bars.map((bar) => (
            <div
              key={bar.id}
              className={`absolute top-1/4 h-6 rounded-full px-2 text-[11px] font-semibold text-white shadow-sm ${
                bar.type === "initiative" ? "bg-primary-600" : "bg-emerald-600"
              }`}
              style={{ left: `${bar.offset}%`, width: `${Math.max(bar.width, 2)}%` }}
              title={`${bar.name} (${bar.startDate} → ${bar.endDate})`}
            >
              <span className="truncate">{bar.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-primary-600" />
            <span>Initiative</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" />
            <span>Sprint</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-0.5 bg-primary-500" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
