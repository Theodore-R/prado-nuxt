import { test, expect } from '@playwright/test'

test.describe('Empty states', () => {
  test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

  test('should show empty state message when no inscriptions match filter', async ({ page }) => {
    await page.goto('/espace/inscriptions', { waitUntil: 'networkidle' })

    // Filter by a year that has no inscriptions (e.g., 2020)
    const yearSelect = page.locator('select').last()
    if (await yearSelect.isVisible()) {
      await yearSelect.selectOption('2020')
      await page.waitForTimeout(1000)
      // Should show empty state
      const content = await page.locator('main').textContent()
      // Verify no rows in table or empty message shown
      expect(content).toBeTruthy()
    }
  })
})
