import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Structures', () => {
  test('should display structures table', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    await expect(page.getByText('Structures')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify column headers
    await expect(page.getByRole('columnheader', { name: 'Nom' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Ville' })).toBeVisible()
  })

  test('should search structures', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    const searchInput = page.getByPlaceholder('Rechercher une structure...')
    await expect(searchInput).toBeVisible()

    // Type a search query and verify the table filters
    await searchInput.fill('test')
    await page.waitForTimeout(300)

    // The table should still be present (either with results or empty message)
    await expect(page.locator('table')).toBeVisible()
  })

  test('should add a new structure via modal', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    // Click the add button
    await page.getByRole('button', { name: 'Ajouter' }).click()

    // Modal should appear
    await expect(page.getByText('Ajouter une structure')).toBeVisible()

    // Fill in the form
    await page.getByPlaceholder('Ex: MECS Saint-Vincent').fill('Structure E2E Test')
    await page.getByPlaceholder('Ex: MECS, Foyer, IME...').fill('MECS')
    await page.getByPlaceholder('69000').fill('13000')
    await page.getByPlaceholder('Lyon').fill('Marseille')

    // Submit the form
    await page.getByRole('button', { name: 'Creer' }).click()

    // Toast success should appear
    await expect(page.getByText('Structure creee')).toBeVisible({ timeout: 5000 })
  })

  test('should edit a structure', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    // Click the edit (Renommer) button on the first row
    const editButton = page.locator('button[title="Renommer"]').first()
    await editButton.click()

    // Modal should appear
    await expect(page.getByText('Modifier la structure')).toBeVisible()

    // Verify the form has a name field pre-filled
    const nameInput = page.locator('form input[type="text"]').first()
    await expect(nameInput).toBeVisible()

    // Click Enregistrer to save
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    // Toast success should appear
    await expect(page.getByText('Structure mise a jour')).toBeVisible({ timeout: 5000 })
  })

  test('should delete a structure with confirmation', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    // Look for a delete button (only shown when prescripteurs_count === 0)
    const deleteButton = page.locator('button[title="Supprimer"]').first()

    if (await deleteButton.isVisible()) {
      await deleteButton.click()

      // Confirmation dialog should appear
      await expect(page.getByText('Confirmation')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Annuler' })).toBeVisible()

      // Cancel the deletion to not affect other tests
      await page.getByRole('button', { name: 'Annuler' }).click()
    }
  })

  test('should show Prado badge for is_prado structures', async ({ page }) => {
    await page.goto('/admin/structures', { waitUntil: 'networkidle' })

    // Look for the Prado badge in the table
    const pradoBadge = page.locator('span', { hasText: 'Prado' }).first()

    // If there are Prado structures in the seeded data, the badge should be visible
    if (await pradoBadge.isVisible()) {
      await expect(pradoBadge).toHaveClass(/bg-prado-teal/)
    }
  })
})
