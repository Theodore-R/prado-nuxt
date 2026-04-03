import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Budget', () => {
  test('should display budget component', async ({ page }) => {
    await page.goto('/admin/budget', { waitUntil: 'networkidle' })

    await expect(page.getByText('Budget')).toBeVisible()
    await expect(
      page.getByText('Donnees confidentielles reservees aux administrateurs'),
    ).toBeVisible()

    // Year selector should be present
    const yearSelect = page.locator('select')
    await expect(yearSelect).toBeVisible()

    // The AdminStatsBudget component should be rendered
    // It is the main content area below the header
    const currentYear = new Date().getFullYear().toString()
    await expect(yearSelect).toHaveValue(currentYear)
  })
})
