import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Actions', () => {
  test('should display actions table', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    await expect(page.getByText('Gestion des actions')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Action' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Inscrits' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Places max' })).toBeVisible()
  })

  test('should edit places_max inline', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    // Find a places_max input in the table
    const placesInput = page.locator('table input[type="number"]').first()

    if (await placesInput.isVisible()) {
      await placesInput.fill('20')

      // Click the save button (title="Sauvegarder places")
      const saveButton = page.locator('button[title="Sauvegarder places"]').first()
      await saveButton.click()

      // Toast success
      await expect(page.getByText('Places mises a jour')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should duplicate an action', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    // Click the duplicate button on the first row
    const duplicateButton = page.locator('button[title="Dupliquer cette action"]').first()

    if (await duplicateButton.isVisible()) {
      await duplicateButton.click()

      // Toast success
      await expect(page.getByText(/dupliquee/)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should archive an action', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    // Click the archive button on the first row
    const archiveButton = page.locator('button[title="Archiver"]').first()

    if (await archiveButton.isVisible()) {
      await archiveButton.click()

      // Toast success
      await expect(page.getByText(/archivee/)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should toggle archived view', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    // Find the "Archives" checkbox label
    const archivesLabel = page.getByText('Archives', { exact: true })
    await expect(archivesLabel).toBeVisible()

    // Toggle the archived checkbox
    const archivesCheckbox = page.locator('input[type="checkbox"]').first()
    await archivesCheckbox.check()

    // Wait for reload
    await page.waitForTimeout(500)

    // The table should still be visible (with archived actions or empty)
    await expect(page.locator('table')).toBeVisible()

    // Uncheck to restore normal view
    await archivesCheckbox.uncheck()
  })

  test('should open cost/recurring edit modal', async ({ page }) => {
    await page.goto('/admin/actions', { waitUntil: 'networkidle' })

    // Click the edit button (Euro icon, title contains "cout")
    const editButton = page.locator('button[title*="cout"]').first()

    if (await editButton.isVisible()) {
      await editButton.click()

      // Modal should appear
      await expect(page.getByText("Modifier l'action")).toBeVisible()
      await expect(page.getByText('Cout (euros)')).toBeVisible()
      await expect(page.getByText('Action recurrente')).toBeVisible()

      // Close the modal
      await page.getByRole('button', { name: 'Annuler' }).click()
    }
  })
})
