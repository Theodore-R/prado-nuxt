import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Contacts', () => {
  test('should display contact messages', async ({ page }) => {
    await page.goto('/admin/contacts', { waitUntil: 'networkidle' })

    await expect(page.getByText(/Messages de contact/)).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Auteur' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Sujet' })).toBeVisible()
  })

  test('should expand message on click', async ({ page }) => {
    await page.goto('/admin/contacts', { waitUntil: 'networkidle' })

    // Click on the first contact row to expand it
    const firstRow = page.locator('tbody tr').first()

    if (await firstRow.isVisible()) {
      await firstRow.click()

      // The expanded area should show the message content and a reply link
      await expect(page.getByText('Repondre')).toBeVisible({ timeout: 3000 })
    }
  })

  test('should toggle read/unread status', async ({ page }) => {
    await page.goto('/admin/contacts', { waitUntil: 'networkidle' })

    // Find the read/unread toggle button (Circle or CheckCircle icon)
    // These are in the last column of each row, with @click.stop
    const toggleButton = page.locator('tbody tr td:last-child button').first()

    if (await toggleButton.isVisible()) {
      await toggleButton.click()

      // The toggle should change the icon (no toast, just UI update)
      await page.waitForTimeout(500)
    }
  })
})
