import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const DEFAULT_BREAKDOWN = [
  { metric: "Velocity (SP)", actual: 35, target: 38 },
  { metric: "Cycle Time (days)", actual: 6.2, target: 6 },
  { metric: "Throughput (issues)", actual: 15, target: 16 },
]

/**
 * Bar chart comparing actual vs target per delivery component.
 */
export function ComponentBreakdownChart({ data = DEFAULT_BREAKDOWN }) {
  const hasData = Array.isArray(data) && data.length > 0

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hasData ? data : DEFAULT_BREAKDOWN} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: "#475569" }} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Legend />
          <ReferenceLine y={0} stroke="#64748b" />
          <Bar dataKey="actual" name="Actual" fill="#0ea5e9" radius={[8, 8, 8, 8]} />
          <Bar dataKey="target" name="Target" fill="#cbd5e1" radius={[8, 8, 8, 8]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
