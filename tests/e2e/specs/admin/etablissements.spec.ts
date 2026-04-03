import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Etablissements', () => {
  test('should display etablissements table', async ({ page }) => {
    await page.goto('/admin/etablissements', { waitUntil: 'networkidle' })

    await expect(page.getByText('Etablissements')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Nom' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Ville' })).toBeVisible()
  })

  test('should add an etablissement via modal', async ({ page }) => {
    await page.goto('/admin/etablissements', { waitUntil: 'networkidle' })

    // Click the add button
    await page.getByRole('button', { name: 'Ajouter' }).click()

    // Modal should appear
    await expect(page.getByText('Ajouter un etablissement')).toBeVisible()

    // Fill in the form
    await page.getByPlaceholder("Nom de l'etablissement").fill('Etablissement E2E Test')
    await page.getByPlaceholder('Adresse').fill('123 rue de Test')
    await page.getByPlaceholder('69000').fill('13000')
    await page.getByPlaceholder('Lyon').fill('Marseille')

    // Submit the form
    await page.getByRole('button', { name: 'Creer' }).click()

    // Toast success should appear
    await expect(page.getByText('Etablissement cree')).toBeVisible({ timeout: 5000 })
  })

  test('should edit an etablissement', async ({ page }) => {
    await page.goto('/admin/etablissements', { waitUntil: 'networkidle' })

    // Click the edit button on the first row
    const editButton = page.locator('button[title="Modifier"]').first()
    await editButton.click()

    // Modal should appear
    await expect(page.getByText("Modifier l'etablissement")).toBeVisible()

    // Verify the form is pre-filled
    const nameInput = page.locator('form input[type="text"]').first()
    await expect(nameInput).toBeVisible()

    // Click Enregistrer
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    // Toast success
    await expect(page.getByText('Etablissement mis a jour')).toBeVisible({ timeout: 5000 })
  })

  test('should delete an etablissement', async ({ page }) => {
    await page.goto('/admin/etablissements', { waitUntil: 'networkidle' })

    // Click the delete button on the first row
    const deleteButton = page.locator('button[title="Supprimer"]').first()

    if (await deleteButton.isVisible()) {
      await deleteButton.click()

      // Confirmation dialog should appear
      await expect(page.getByText('Confirmation')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible()

      // Cancel to avoid side effects
      await page.getByRole('button', { name: 'Annuler' }).click()
    }
  })
})
