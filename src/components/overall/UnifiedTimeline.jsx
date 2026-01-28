import { useMemo } from "react"
import { GanttChart } from "../common/GanttChart"

/** @typedef {import("./types").UnifiedTimelineProps} UnifiedTimelineProps */

const SAMPLE_ITEMS = [
  {
    id: "INIT-01",
    name: "Initiative: Improve Delivery",
    squad: "A-Team",
    startDate: "2026-01-05",
    endDate: "2026-02-10",
    type: "initiative",
  },
  {
    id: "SPR-201",
    name: "Sprint 12",
    squad: "A-Team",
    startDate: "2026-01-05",
    endDate: "2026-01-19",
    type: "sprint",
  },
  {
    id: "SPR-202",
    name: "Sprint 13",
    squad: "A-Team",
    startDate: "2026-01-20",
    endDate: "2026-02-03",
    type: "sprint",
  },
  {
    id: "INIT-02",
    name: "Initiative: Platform Hardening",
    squad: "B-Team",
    startDate: "2026-01-10",
    endDate: "2026-02-20",
    type: "initiative",
  },
  {
    id: "SPR-301",
    name: "Sprint Yellow",
    squad: "B-Team",
    startDate: "2026-01-10",
    endDate: "2026-01-24",
    type: "sprint",
  },
]

/**
 * Unified timeline view combining initiatives and sprints.
 * @param {UnifiedTimelineProps} props
 */
export function UnifiedTimeline({ items = SAMPLE_ITEMS }) {
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [items])

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-bold text-slate-900">Unified Timeline</h2>
        <p className="text-sm text-slate-600">Initiatives and sprints in one view</p>
      </header>
      <GanttChart items={sorted} />
    </section>
  )
}
