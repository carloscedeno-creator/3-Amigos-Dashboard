export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary-500">
              Delivery Dashboard
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Infraestructura Base
            </h1>
            <p className="text-sm text-slate-600">
              Tailwind 3.x listo con paleta personalizada.
            </p>
          </div>
          <span className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow">
            bg-primary-500
          </span>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-primary-800">
            <p className="text-sm font-semibold">Primary</p>
            <p className="text-sm">Usa la paleta extendida para UI.</p>
          </div>
          <div className="rounded-lg border border-success-100 bg-success-50 px-4 py-3 text-success-800">
            <p className="text-sm font-semibold">Success</p>
            <p className="text-sm">Estados satisfactorios y confirmaciones.</p>
          </div>
          <div className="rounded-lg border border-warning-100 bg-warning-50 px-4 py-3 text-warning-800">
            <p className="text-sm font-semibold">Warning</p>
            <p className="text-sm">Mensajes preventivos y avisos.</p>
          </div>
          <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-danger-800">
            <p className="text-sm font-semibold">Danger</p>
            <p className="text-sm">Errores y estados críticos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
