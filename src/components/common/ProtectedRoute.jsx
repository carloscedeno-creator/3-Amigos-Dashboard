import { canAccess } from "@/config/permissions"

export function ProtectedRoute({ role, moduleId, children }) {
  const hasAccess = canAccess(role, moduleId)

  if (!hasAccess) {
    return (
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 text-warning-900">
        <p className="font-semibold">Access denied</p>
        <p className="text-sm text-warning-800">You do not have permission to view this module.</p>
      </div>
    )
  }

  return children
}
