import { useEffect, useMemo, useState } from "react"
import { ActivitySquare, KanbanSquare, LayoutDashboard, PackageCheck, Users } from "lucide-react"
import { getSupabaseClient } from "@/utils/supabaseApi"
import { Login } from "@/components/auth/Login"
import { ForgotPassword } from "@/components/auth/ForgotPassword"
import { Signup } from "@/components/auth/Signup"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { getAccessibleModules, MODULES } from "@/config/permissions"
import { getUserRole, logout, onAuthStateChange } from "@/utils/authService"
import { Layout } from "@/components/layout/Layout"
import { OverallView } from "@/components/overall/OverallView"
import { ActiveSprintsSummary } from "@/components/overall/ActiveSprintsSummary"
import { UnifiedTimeline } from "@/components/overall/UnifiedTimeline"
import { QuickAlerts } from "@/components/overall/QuickAlerts"
import { DeliveryKPIs } from "@/components/delivery/DeliveryKPIs"
import { ProjectsMetrics } from "@/components/projects/ProjectsMetrics"
import { DeveloperMetrics } from "@/components/developer/DeveloperMetrics"

const NAV_ITEMS = [
  { id: MODULES.OVERALL, label: "Overall View", icon: LayoutDashboard },
  { id: MODULES.DELIVERY, label: "Delivery Metrics", icon: PackageCheck },
  { id: MODULES.PROJECTS, label: "Projects Metrics", icon: KanbanSquare },
  { id: MODULES.DEVELOPERS, label: "Developers", icon: Users },
  { id: MODULES.CAPACITY, label: "Capacity", icon: ActivitySquare },
]

const VIEW_COPY = {
  overall: {
    title: "Overall View",
    description: "KPIs, active sprints, alerts, and unified timeline.",
  },
  delivery: {
    title: "Delivery Metrics",
    description: "Delivery Success Score, velocity, cycle time, and throughput.",
  },
  projects: {
    title: "Projects Metrics",
    description: "Sprint metrics, board state, scope changes, and PDF export.",
  },
  developers: {
    title: "Developers",
    description: "Per-developer KPIs, burndown, and issues.",
  },
  capacity: {
    title: "Capacity",
    description: "Planned vs available capacity per sprint (coming soon).",
  },
}

const Placeholder = ({ title, description }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="text-sm text-slate-600">{description}</p>
  </div>
)

export function App() {
  const [activeView, setActiveView] = useState(MODULES.OVERALL)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [configError, setConfigError] = useState(null)

  useEffect(() => {
    let isMounted = true
    let unsubscribe = () => {}

    try {
      const supabase = getSupabaseClient()

      supabase.auth.getSession().then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          setAuthLoading(false)
          return
        }
        setUser(data?.session?.user ?? null)
        setAuthLoading(false)
      })

      unsubscribe = onAuthStateChange((_, session) => {
        setUser(session?.user ?? null)
        if (!session) {
          setActiveView(MODULES.OVERALL)
        }
      })
    } catch (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfigError(error?.message || "Faltan variables de entorno")
      setAuthLoading(false)
    }

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const role = getUserRole(user)
  const accessibleNavItems = useMemo(() => {
    const allowed = getAccessibleModules(role)
    return NAV_ITEMS.filter((item) => allowed.includes(item.id))
  }, [role])

  useEffect(() => {
    const allowedViews = accessibleNavItems.map((item) => item.id)
    if (allowedViews.length && !allowedViews.includes(activeView)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveView(allowedViews[0])
    }
  }, [accessibleNavItems, activeView])

  const currentCopy = useMemo(() => VIEW_COPY[activeView], [activeView])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const renderActiveView = () => {
    if (activeView === MODULES.OVERALL) {
      return (
        <div className="space-y-6">
          <OverallView />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <UnifiedTimeline />
              <ActiveSprintsSummary />
            </div>
            <QuickAlerts />
          </div>
        </div>
      )
    }

    if (activeView === MODULES.DELIVERY) {
      return <DeliveryKPIs />
    }

    if (activeView === MODULES.PROJECTS) {
      return <ProjectsMetrics />
    }

    if (activeView === MODULES.DEVELOPERS) {
      return <DeveloperMetrics />
    }

    if (activeView === MODULES.CAPACITY) {
      return <Placeholder title="Capacity" description="Planned vs available capacity per sprint will be shown here." />
    }

    return <Placeholder title="Coming soon" description="Select a module to view its dashboard." />
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <p className="text-sm font-medium">Checking session...</p>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="max-w-lg rounded-lg border border-danger-200 bg-danger-50 p-6 shadow-sm">
          <p className="text-lg font-semibold text-danger-800">Incomplete configuration</p>
          <p className="mt-2 text-sm text-danger-700">{configError}</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-danger-700">
            <li>Set VITE_SUPABASE_URL in .env.local</li>
            <li>Set VITE_SUPABASE_ANON_KEY in .env.local</li>
            <li>Restart `npm run dev` after saving</li>
          </ul>
        </div>
      </div>
    )
  }

  if (!user) {
    if (showForgotPassword) {
      return (
        <ForgotPassword
          onBackToLogin={() => {
            setShowForgotPassword(false)
            setShowSignup(false)
          }}
        />
      )
    }

    if (showSignup) {
      return (
        <Signup
          onSuccess={setUser}
          onBackToLogin={() => {
            setShowSignup(false)
            setShowForgotPassword(false)
          }}
        />
      )
    }

    return (
      <Login
        onSuccess={setUser}
        onForgotPassword={() => {
          setShowForgotPassword(true)
          setShowSignup(false)
        }}
        onCreateAccount={() => {
          setShowSignup(true)
          setShowForgotPassword(false)
        }}
      />
    )
  }

  return (
    <Layout
      navItems={accessibleNavItems}
      activeView={activeView}
      onChangeView={setActiveView}
      user={user}
      onLogout={handleLogout}
    >
      <ProtectedRoute role={role} moduleId={activeView}>
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

          {renderActiveView()}
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
