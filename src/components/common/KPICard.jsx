import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

/** @typedef {import("./types").KPICardProps} KPICardProps */

const COLOR_STYLES = {
  primary: {
    iconBg: "bg-primary-50",
    iconText: "text-primary-700",
    ring: "ring-primary-100",
  },
  success: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-700",
    ring: "ring-emerald-100",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-700",
    ring: "ring-amber-100",
  },
  danger: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-700",
    ring: "ring-rose-100",
  },
  muted: {
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    ring: "ring-slate-200",
  },
}

const TREND_STYLES = {
  up: { text: "text-emerald-700", bg: "bg-emerald-50", Icon: ArrowUpRight, label: "Up" },
  down: { text: "text-rose-700", bg: "bg-rose-50", Icon: ArrowDownRight, label: "Down" },
  neutral: { text: "text-slate-600", bg: "bg-slate-100", Icon: Minus, label: "Neutral" },
}

/**
 * Compact KPI card with value, label and trend indicator.
 * @param {KPICardProps} props
 */
export function KPICard({
  title,
  value,
  label,
  trend = "neutral",
  color = "primary",
  icon: Icon,
  tooltip,
  children,
}) {
  const accent = COLOR_STYLES[color] || COLOR_STYLES.primary
  const trendStyle = TREND_STYLES[trend] || TREND_STYLES.neutral
  const TrendIcon = trendStyle.Icon

  return (
    <article
      className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      title={tooltip || title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            {label ? <span className="text-sm font-semibold text-slate-500">{label}</span> : null}
          </div>
        </div>

        {Icon ? (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.iconBg} ${accent.iconText} ring-4 ${accent.ring}`}
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trendStyle.bg} ${trendStyle.text}`}
        >
          <TrendIcon className="h-4 w-4" />
          {trendStyle.label}
        </span>
        {children ? <div className="text-sm text-slate-600">{children}</div> : null}
      </div>
    </article>
  )
}
