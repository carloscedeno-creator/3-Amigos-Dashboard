/* global process */
import { test, expect } from "@playwright/test"

const email = process.env.PLAYWRIGHT_E2E_EMAIL
const password = process.env.PLAYWRIGHT_E2E_PASSWORD

test.describe("Projects Metrics", () => {
  test.skip(!email || !password, "Requires PLAYWRIGHT_E2E_EMAIL and PLAYWRIGHT_E2E_PASSWORD")

  test("renders projects metrics with KPIs and charts", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Delivery Dashboard")).toBeVisible()

    // Open navigation if on mobile
    const openNav = page.getByRole("button", { name: "Open navigation" })
    if (await openNav.isVisible()) {
      await openNav.click()
    }

    const projectsNav = page.getByRole("button", { name: "Projects Metrics" })
    if (!(await projectsNav.isVisible())) {
      test.skip("Projects Metrics not accessible for this user role")
    }

    await projectsNav.click()

    await expect(page.getByRole("heading", { name: "Projects Metrics" })).toBeVisible()

    await expect(page.getByLabel("Squad")).toBeVisible()
    await expect(page.getByLabel("Sprint")).toBeVisible()

    await expect(page.getByText("SP Done vs Goal")).toBeVisible()
    await expect(page.getByText("Velocity")).toBeVisible()
    await expect(page.getByText("Scope Added")).toBeVisible()
    await expect(page.getByText("Scope Net Change")).toBeVisible()

    await expect(page.getByText("Board State breakdown")).toBeVisible()
    await expect(page.getByText("Scope changes")).toBeVisible()

    const exportButton = page.getByRole("button", { name: "Export PDF" })
    await expect(exportButton).toBeEnabled()
  })
})
