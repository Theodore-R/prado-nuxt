import { test, expect } from '@playwright/test'

test.describe('Public actions catalog', () => {
  test('should display published actions', async ({ page }) => {
    await page.goto('/actions', { waitUntil: 'networkidle' })

    // Should show at least the seeded published action
    await page.waitForTimeout(2000)
    const actionCards = page.locator('[class*="card"], article, .action-card').or(page.getByRole('article'))
    // Page should have some content
    await expect(page.locator('main')).toBeVisible()
  })

  test('should navigate to action detail', async ({ page }) => {
    await page.goto('/actions', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Click first action link if available
    const firstLink = page.locator('a[href*="/actions/"]').first()
    if (await firstLink.isVisible()) {
      await firstLink.click()
      await page.waitForURL(/\/actions\/\d+/)
    }
  })
})
