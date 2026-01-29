import { Funnel } from "lucide-react"

const DEFAULT_SQUADS = [
  { value: "all", label: "All squads" },
  { value: "a-team", label: "A-Team" },
  { value: "b-team", label: "B-Team" },
]

const DEFAULT_SPRINTS = [{ value: "all", label: "All sprints" }]

const DEFAULT_RANGES = [
  { value: "recent", label: "Recent" },
  { value: "last-4", label: "Last 4" },
  { value: "last-6", label: "Last 6" },
]

/**
 * Filter controls for Delivery KPIs (squad, sprint, date range).
 */
export function DeliveryKPIFilters({
  filters,
  onChange,
  squadOptions = DEFAULT_SQUADS,
  sprintOptions = DEFAULT_SPRINTS,
  rangeOptions = DEFAULT_RANGES,
}) {
  const handleChange = (key) => (event) => {
    onChange?.({ ...filters, [key]: event.target.value })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Funnel className="h-4 w-4 text-primary-600" />
        Filters
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Squad</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={filters.squad}
            onChange={handleChange("squad")}
          >
            {squadOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Sprint</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
            value={filters.sprint}
            onChange={handleChange("sprint")}
          >
            {sprintOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {filters.sprint === "all" ? (
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Date range</span>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
              value={filters.range}
              onChange={handleChange("range")}
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="space-y-1 text-sm font-medium text-slate-500">
            <span>Date range</span>
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Range not applicable when a specific sprint is selected.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
