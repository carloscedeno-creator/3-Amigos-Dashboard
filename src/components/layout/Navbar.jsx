export function Navbar({ onMenuClick, user, onLogout }) {
  const displayName = user?.user_metadata?.full_name || user?.email || "Usuario"
  const email = user?.email || ""
  const avatarLetter = displayName?.charAt(0)?.toUpperCase?.() || "U"

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            aria-label="Open navigation"
          >
            <span className="h-5 w-5">☰</span>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
              Delivery Manager
            </p>
            <h1 className="text-lg font-bold text-slate-900">Reporter</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {avatarLetter}
          </div>
          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
