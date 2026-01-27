const baseItemClasses =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"

function NavigationList({ items, activeId, onSelect }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.id === activeId
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            className={`${baseItemClasses} ${
              isActive
                ? "bg-primary-50 text-primary-700 ring-1 ring-primary-200"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function Sidebar({ items = [], activeId, onSelect, isOpen, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
        <div className="flex flex-col gap-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
          <NavigationList items={items} activeId={activeId} onSelect={onSelect} />
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 transition-opacity duration-200 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <NavigationList items={items} activeId={activeId} onSelect={onSelect} />
        </div>
      </aside>
    </>
  )
}
