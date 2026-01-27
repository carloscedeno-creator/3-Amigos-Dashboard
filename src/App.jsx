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
import { SampleCard } from "@/components/SampleCard"

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
    description: "General overview of squads and their KPIs.",
  },
  delivery: {
    title: "Delivery Metrics",
    description: "Velocity, throughput, and delivery cadence.",
  },
  projects: {
    title: "Projects Metrics",
    description: "Sprints, scope changes, and board state.",
  },
  developers: {
    title: "Developers",
    description: "Per-developer KPIs and workload.",
  },
  capacity: {
    title: "Capacity",
    description: "Planned vs available capacity per sprint.",
  },
}

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
      setActiveView(allowedViews[0])
    }
  }, [accessibleNavItems, activeView])

  const currentCopy = useMemo(() => VIEW_COPY[activeView], [activeView])

  const handleLogout = async () => {
    await logout()
    setUser(null)
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-primary-800">
              <p className="text-sm font-semibold">Primary</p>
              <p className="text-sm">Extended palette ready for UI.</p>
            </div>
            <div className="rounded-lg border border-success-100 bg-success-50 px-4 py-3 text-success-800">
              <p className="text-sm font-semibold">Success</p>
              <p className="text-sm">Positive states and confirmations.</p>
            </div>
            <div className="rounded-lg border border-warning-100 bg-warning-50 px-4 py-3 text-warning-800">
              <p className="text-sm font-semibold">Warning</p>
              <p className="text-sm">Preventive messages and notices.</p>
            </div>
            <div className="rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-danger-800">
              <p className="text-sm font-semibold">Danger</p>
              <p className="text-sm">Errors and critical states.</p>
            </div>
          </div>

          <SampleCard />
        </div>
      </ProtectedRoute>
    </Layout>
  )
}
