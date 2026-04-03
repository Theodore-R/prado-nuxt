import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Prescripteurs', () => {
  test('should display prescripteurs table', async ({ page }) => {
    await page.goto('/admin/prescripteurs', { waitUntil: 'networkidle' })

    await expect(page.getByText('Prescripteurs')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Nom' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Statut' })).toBeVisible()
  })

  test('should filter by status tabs (Tous, En attente, Approuves, Rejetes)', async ({ page }) => {
    await page.goto('/admin/prescripteurs', { waitUntil: 'networkidle' })

    const tabs = ['Tous', 'En attente', 'Approuves', 'Rejetes']

    for (const tab of tabs) {
      const tabButton = page.getByRole('button', { name: tab, exact: true })
      await expect(tabButton).toBeVisible()
    }

    // Click "En attente" tab and verify it becomes active
    await page.getByRole('button', { name: 'En attente', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'En attente', exact: true }),
    ).toHaveClass(/bg-prado-sage/)

    // Click "Approuves" tab
    await page.getByRole('button', { name: 'Approuves', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Approuves', exact: true }),
    ).toHaveClass(/bg-prado-sage/)

    // Click "Rejetes" tab
    await page.getByRole('button', { name: 'Rejetes', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Rejetes', exact: true }),
    ).toHaveClass(/bg-prado-sage/)

    // Return to "Tous"
    await page.getByRole('button', { name: 'Tous', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Tous', exact: true }),
    ).toHaveClass(/bg-prado-sage/)
  })

  test('should approve a pending prescripteur', async ({ page }) => {
    await page.goto('/admin/prescripteurs', { waitUntil: 'networkidle' })

    // Switch to "En attente" tab to find pending prescripteurs
    await page.getByRole('button', { name: 'En attente', exact: true }).click()
    await page.waitForTimeout(300)

    // Look for the approve button (CheckCircle icon)
    const approveButton = page.locator('button[title="Approuver"]').first()

    if (await approveButton.isVisible()) {
      await approveButton.click()

      // Confirmation dialog should appear
      await expect(page.getByText('Confirmation')).toBeVisible()
      await expect(page.getByText('Approuver ce prescripteur ?')).toBeVisible()

      // Confirm the approval
      await page.getByRole('button', { name: 'Confirmer' }).click()

      // Toast success
      await expect(page.getByText('Compte approuve')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should reject a prescripteur', async ({ page }) => {
    await page.goto('/admin/prescripteurs', { waitUntil: 'networkidle' })

    // Look for the reject button (XCircle icon)
    const rejectButton = page.locator('button[title="Rejeter"]').first()

    if (await rejectButton.isVisible()) {
      await rejectButton.click()

      // Confirmation dialog should appear
      await expect(page.getByText('Confirmation')).toBeVisible()
      await expect(page.getByText('Rejeter ce prescripteur ?')).toBeVisible()

      // Cancel to avoid side effects
      await page.getByRole('button', { name: 'Annuler' }).click()
    }
  })

  test('should export CSV', async ({ page }) => {
    await page.goto('/admin/prescripteurs', { waitUntil: 'networkidle' })

    const exportButton = page.getByRole('button', { name: 'Exporter CSV' })
    await expect(exportButton).toBeVisible()

    // Click and verify toast
    await exportButton.click()
    await expect(page.getByText('Export CSV telecharge')).toBeVisible({ timeout: 5000 })
  })
})
