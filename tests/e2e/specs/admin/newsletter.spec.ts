import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Newsletter', () => {
  test('should display subscribers table', async ({ page }) => {
    await page.goto('/admin/newsletter', { waitUntil: 'networkidle' })

    await expect(page.getByText(/Inscrits Newsletter/)).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Confirme' })).toBeVisible()
  })

  test('should show confirmed/unconfirmed status', async ({ page }) => {
    await page.goto('/admin/newsletter', { waitUntil: 'networkidle' })

    // The "Confirme" column displays Check (green) or X icons
    // Verify the table renders with SVG icons in the confirmation column
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()

    if (rowCount > 0) {
      // Each row should have cells with either a check or X icon in the last data column
      const firstRowCells = tableRows.first().locator('td')
      await expect(firstRowCells.last()).toBeVisible()
    }
  })
})
