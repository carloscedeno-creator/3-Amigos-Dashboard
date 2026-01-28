import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const DEFAULT_HISTORY = [
  { name: "S-10", score: 68, target: 75 },
  { name: "S-11", score: 72, target: 75 },
  { name: "S-12", score: 77, target: 76 },
  { name: "S-13", score: 81, target: 78 },
  { name: "S-14", score: 79, target: 80 },
  { name: "S-15", score: 84, target: 82 },
]

/**
 * Line chart for Delivery Score history with target reference.
 */
export function DeliveryScoreChart({ data = DEFAULT_HISTORY, target = 80 }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475569" }} />
          <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <ReferenceLine y={target} stroke="#0ea5e9" strokeDasharray="4 4" label="Target" />
          <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="target" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
