import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Inscriptions', () => {
  test('should display inscriptions table with relations', async ({ page }) => {
    await page.goto('/admin/inscriptions', { waitUntil: 'networkidle' })

    await expect(page.getByText(/Inscriptions/)).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers showing related data
    await expect(page.getByRole('columnheader', { name: 'Jeune' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Prescripteur' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible()
  })

  test('should search inscriptions', async ({ page }) => {
    await page.goto('/admin/inscriptions', { waitUntil: 'networkidle' })

    const searchInput = page.getByPlaceholder('Rechercher une inscription...')
    await expect(searchInput).toBeVisible()

    // Type a search query
    await searchInput.fill('test')
    await page.waitForTimeout(300)

    // Table should still be visible
    await expect(page.locator('table')).toBeVisible()
  })
})
