/* global process */
import { test, expect } from "@playwright/test"

const email = process.env.PLAYWRIGHT_E2E_EMAIL
const password = process.env.PLAYWRIGHT_E2E_PASSWORD

test.describe("Smoke - login", () => {
  test("renders login and signs in", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: "Sign in" }).click()

    // After login, dashboard header should be visible
    await expect(page.getByText("Delivery Dashboard")).toBeVisible()
  })
})
