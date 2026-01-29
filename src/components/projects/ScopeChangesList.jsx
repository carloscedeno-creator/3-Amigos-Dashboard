const formatDate = (value) => {
  if (!value) return ""
  return new Date(value).toLocaleDateString()
}

const Section = ({ title, items = [], accent }) => (
  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <span className={`h-2 w-2 rounded-full ${accent}`} />
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-slate-500">No items</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{item.key}</span>
              <span className="text-slate-500">{formatDate(item.changedAt)}</span>
            </div>
            <p className="text-slate-600">{item.title}</p>
            {item.storyPoints !== undefined && (
              <p className="text-[11px] text-slate-500">Story Points: {item.storyPoints}</p>
            )}
            {item.delta !== undefined && <p className="text-[11px] text-slate-500">Δ SP: {item.delta}</p>}
          </li>
        ))}
      </ul>
    )}
  </div>
)

export function ScopeChangesList({ changes = { added: [], removed: [], changed: [] } }) {
  const added = changes?.added || []
  const removed = changes?.removed || []
  const changed = changes?.changed || []
  const isEmpty = !added.length && !removed.length && !changed.length

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No hubo cambios de scope en este sprint.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Section title="Added" items={added} accent="bg-emerald-400" />
      <Section title="Removed" items={removed} accent="bg-slate-400" />
      <Section title="Story Points changed" items={changed} accent="bg-amber-400" />
    </div>
  )
}
