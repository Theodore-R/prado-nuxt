import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Statistiques', () => {
  test('should display 4 stat components', async ({ page }) => {
    await page.goto('/admin/statistiques', { waitUntil: 'networkidle' })

    await expect(page.getByText('Statistiques')).toBeVisible()

    // The page renders a 2x2 grid with 4 stat components:
    // AdminStatsProfilsSituations, AdminStatsProvenances, AdminStatsActions, AdminStatsBudget
    const statsGrid = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2')
    await expect(statsGrid).toBeVisible()

    // Each stat component should be a direct child of the grid
    const statComponents = statsGrid.locator('> *')
    await expect(statComponents).toHaveCount(4)
  })
})
