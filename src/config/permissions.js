const MODULES = {
  OVERALL: "overall",
  DELIVERY: "delivery",
  PROJECTS: "projects",
  DEVELOPERS: "developers",
  CAPACITY: "capacity",
  ROADMAPS: "roadmaps",
  KPIS: "kpis",
  ENPS: "enps",
  ADMIN: "admin",
  REPORTING: "reporting",
}

export const ROLE_PERMISSIONS = {
  admin: Object.values(MODULES),
  pm: [MODULES.OVERALL, MODULES.DELIVERY, MODULES.PROJECTS, MODULES.ROADMAPS, MODULES.KPIS, MODULES.REPORTING],
  engineering_manager: [
    MODULES.OVERALL,
    MODULES.DELIVERY,
    MODULES.PROJECTS,
    MODULES.DEVELOPERS,
    MODULES.CAPACITY,
    MODULES.KPIS,
    MODULES.REPORTING,
  ],
  developer: [MODULES.OVERALL, MODULES.DEVELOPERS, MODULES.CAPACITY, MODULES.KPIS],
  stakeholder: [MODULES.OVERALL, MODULES.DELIVERY, MODULES.PROJECTS, MODULES.REPORTING],
  three_amigos: [
    MODULES.OVERALL,
    MODULES.DELIVERY,
    MODULES.PROJECTS,
    MODULES.DEVELOPERS,
    MODULES.CAPACITY,
    MODULES.ROADMAPS,
    MODULES.KPIS,
    MODULES.REPORTING,
  ],
}

export function canAccess(role, moduleId) {
  if (!role || !moduleId) return false
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(moduleId)
}

export function getAccessibleModules(role) {
  return ROLE_PERMISSIONS[role] || []
}

export { MODULES }
