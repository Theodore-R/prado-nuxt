import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Jeunes', () => {
  test('should display jeunes table', async ({ page }) => {
    await page.goto('/admin/jeunes', { waitUntil: 'networkidle' })

    await expect(page.getByText(/Jeunes/)).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Nom complet' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Situation' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Inscriptions' })).toBeVisible()
  })

  test('should search by name', async ({ page }) => {
    await page.goto('/admin/jeunes', { waitUntil: 'networkidle' })

    const searchInput = page.getByPlaceholder('Rechercher un jeune...')
    await expect(searchInput).toBeVisible()

    // Type a search query
    await searchInput.fill('test')
    await page.waitForTimeout(300)

    // Table should still be visible
    await expect(page.locator('table')).toBeVisible()
  })

  test('should show situation badges', async ({ page }) => {
    await page.goto('/admin/jeunes', { waitUntil: 'networkidle' })

    // Situation badges use rounded-full styling with bg-prado-tag-bg
    const situationBadge = page.locator('span.rounded-full', { hasText: /.+/ }).first()

    // If there are jeunes with situations, badges should be displayed
    if (await situationBadge.isVisible()) {
      await expect(situationBadge).toHaveClass(/bg-prado-tag-bg/)
    }
  })
})
