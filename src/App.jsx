import { useMemo, useState } from "react"
import { ActivitySquare, KanbanSquare, LayoutDashboard, PackageCheck, Users } from "lucide-react"
import { Layout } from "@/components/layout/Layout"
import { SampleCard } from "@/components/SampleCard"

const NAV_ITEMS = [
  { id: "overall", label: "Overall View", icon: LayoutDashboard },
  { id: "delivery", label: "Delivery Metrics", icon: PackageCheck },
  { id: "projects", label: "Projects Metrics", icon: KanbanSquare },
  { id: "developers", label: "Developers", icon: Users },
  { id: "capacity", label: "Capacity", icon: ActivitySquare },
]

const VIEW_COPY = {
  overall: {
    title: "Overall View",
    description: "Panorama general de las squads y sus KPIs.",
  },
  delivery: {
    title: "Delivery Metrics",
    description: "Velocidad, throughput y ciclo de entrega.",
  },
  projects: {
    title: "Projects Metrics",
    description: "Sprints, scope changes y estado de tableros.",
  },
  developers: {
    title: "Developers",
    description: "KPIs por desarrollador y carga de trabajo.",
  },
  capacity: {
    title: "Capacity",
    description: "Capacidad planificada vs disponible por sprint.",
  },
}

export function App() {
  const [activeView, setActiveView] = useState("overall")
  const currentCopy = useMemo(() => VIEW_COPY[activeView], [activeView])

  return (
    <Layout navItems={NAV_ITEMS} activeView={activeView} onChangeView={setActiveView}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary-500">Delivery Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900">{currentCopy?.title}</h1>
            <p className="text-sm text-slate-600">{currentCopy?.description}</p>
          </div>
          <span className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow">
            {activeView}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-primary-800">
            <p className="text-sm font-semibold">Primary</p>
            <p className="text-sm">Paleta extendida lista para UI.</p>
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

        <SampleCard />
      </div>
    </Layout>
  )
}
