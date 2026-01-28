import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts"

const STATUS_COLORS = {
  done: "#22c55e",
  inProgress: "#0ea5e9",
  todo: "#cbd5e1",
  blocked: "#f97316",
}

const normalizeStatus = (status = "") => {
  const normalized = status.toLowerCase()
  if (normalized.includes("done")) return "done"
  if (normalized.includes("in progress") || normalized.includes("progress")) return "inProgress"
  if (normalized.includes("blocked")) return "blocked"
  return "todo"
}

const buildData = (issues = []) => {
  const buckets = { done: 0, inProgress: 0, todo: 0, blocked: 0 }
  issues.forEach((issue) => {
    const bucket = normalizeStatus(issue.status)
    buckets[bucket] += 1
  })

  return Object.entries(buckets).map(([status, value]) => ({
    name: status === "inProgress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1),
    value,
    fill: STATUS_COLORS[status],
  }))
}

const DEFAULT_DATA = buildData([
  { status: "Done" },
  { status: "Done" },
  { status: "In Progress" },
  { status: "To Do" },
  { status: "Blocked" },
])

export function BoardStateBreakdown({ issues = [] }) {
  const data = buildData(Array.isArray(issues) && issues.length ? issues : DEFAULT_DATA)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} paddingAngle={2} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-slate-600">Total issues: {total}</p>
    </div>
  )
}
