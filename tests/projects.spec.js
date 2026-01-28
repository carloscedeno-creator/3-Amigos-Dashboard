/* global process */
import { test, expect } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"

const email = process.env.PLAYWRIGHT_E2E_EMAIL
const password = process.env.PLAYWRIGHT_E2E_PASSWORD

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function ensureTestUser() {
  if (!supabaseUrl || !supabaseServiceRoleKey || !email || !password) return

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
  } catch (error) {
    // Ignore if the user already exists
    if (!error?.message?.includes("already registered")) {
      throw error
    }
  }
}

async function signIn(page) {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()

  // Wait for either success or an auth error
  const dashboardHeader = page.getByRole("heading", { name: "Overall View", level: 1 })
  const authError = page.getByText("Invalid login credentials")

  await Promise.race([
    dashboardHeader.waitFor({ state: "visible", timeout: 10000 }),
    authError.waitFor({ state: "visible", timeout: 10000 }),
  ])

  if (await authError.isVisible()) {
    throw new Error("Login failed with provided PLAYWRIGHT_E2E_EMAIL/PASSWORD")
  }
}

test.describe("Projects Metrics", () => {
  test.beforeAll(async () => {
    await ensureTestUser()
  })

  test("renders projects metrics with KPIs and charts", async ({ page }) => {
    await signIn(page)

    // Open navigation if on mobile
    const openNav = page.getByRole("button", { name: "Open navigation" })
    if (await openNav.isVisible()) {
      await openNav.click()
    }

    const projectsNav = page.getByRole("button", { name: "Projects Metrics" })
    await expect(projectsNav).toBeVisible()
    await projectsNav.click()

    await expect(page.getByRole("heading", { name: "Projects Metrics", level: 1 })).toBeVisible()

    await expect(page.getByLabel("Squad")).toBeVisible()
    await expect(page.getByLabel("Sprint")).toBeVisible()

    await expect(page.getByText("SP Done vs Goal")).toBeVisible()
    await expect(page.getByText("Velocity")).toBeVisible()
    await expect(page.getByText("Scope Added")).toBeVisible()
    await expect(page.getByText("Scope Net Change")).toBeVisible()

    await expect(page.getByText("Board State breakdown", { exact: true })).toBeVisible()
    await expect(page.getByText("Scope changes", { exact: true })).toBeVisible()

    const exportButton = page.getByRole("button", { name: "Export PDF" })
    await expect(exportButton).toBeEnabled()
  })
})
