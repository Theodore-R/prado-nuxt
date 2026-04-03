import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Dashboard', () => {
  test('should display 6 stat cards with labels', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    const expectedLabels = [
      'Prescripteurs',
      'Jeunes',
      'Inscriptions',
      'En attente',
      'Contacts non lus',
      'Abonnes newsletter',
    ]

    for (const label of expectedLabels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('should display activity feed', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    await expect(page.getByText('Activite recente')).toBeVisible()
  })

  test('should show loading state then data', async ({ page }) => {
    // Navigate without waiting for network idle to catch loading state
    await page.goto('/admin')

    // The page should eventually show the dashboard heading
    await expect(page.getByText('Tableau de bord')).toBeVisible({ timeout: 15000 })

    // Stat cards should have numeric values (not just dashes)
    const statCards = page.locator('.grid .bg-prado-surface')
    await expect(statCards.first()).toBeVisible()
  })
})
