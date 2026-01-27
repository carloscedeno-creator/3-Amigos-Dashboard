import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

const DEFAULT_NAV_ITEMS = [
  { id: "overall", label: "Overall View" },
  { id: "delivery", label: "Delivery Metrics" },
  { id: "projects", label: "Projects Metrics" },
  { id: "developers", label: "Developers" },
  { id: "capacity", label: "Capacity" },
]

export function Layout({ children, navItems = DEFAULT_NAV_ITEMS, activeView, onChangeView }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev)
  }

  const handleSelect = (itemId) => {
    onChangeView?.(itemId)
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onMenuClick={toggleMobileSidebar} />

      <div className="flex">
        <Sidebar
          items={navItems}
          activeId={activeView}
          onSelect={handleSelect}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
