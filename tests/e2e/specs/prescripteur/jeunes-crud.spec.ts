import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Jeunes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace/jeunes', { waitUntil: 'networkidle' })
  })

  test('should display jeunes table', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // Table should show seeded jeunes (Jean, Marie, Lucas, Emma Test)
    await expect(page.getByText('Jean Test')).toBeVisible()
    await expect(page.getByText('Marie Test')).toBeVisible()
    await expect(page.getByText('Lucas Test')).toBeVisible()
    await expect(page.getByText('Emma Test')).toBeVisible()

    // Table columns: Nom complet, Date de naissance, Situation, Inscriptions
    await expect(page.getByText('Nom complet')).toBeVisible()
  })

  test('should add a new jeune', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // Click "Ajouter" button
    await page.getByRole('button', { name: 'Ajouter' }).click()

    // Fill in the form
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Fill first name
    await form.locator('input[type="text"]').first().fill('Nouveau')

    // Fill last name
    await form.locator('input[type="text"]').nth(1).fill('TestE2E')

    // Fill date of birth via the date picker component
    const dobSection = form.locator('text=Date de naissance').locator('..')
    // The UiDateOfBirthPicker has day/month/year selects or input
    // Try to fill the date of birth field
    const dobInput = dobSection.locator('input, select').first()
    if (await dobInput.isVisible()) {
      // If it's an input field, fill it directly
      const tagName = await dobInput.evaluate(el => el.tagName.toLowerCase())
      if (tagName === 'input') {
        await dobInput.fill('2005-06-15')
      }
    }

    // Select situation
    await form.locator('select').last().selectOption({ label: 'Sans emploi' })

    // Submit
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    // Wait for success toast
    await expect(page.getByText('Fiche jeune creee')).toBeVisible({ timeout: 10000 })

    // New jeune should appear in the table
    await expect(page.getByText('Nouveau TestE2E')).toBeVisible()
  })

  test('should search jeunes by name', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // Use the search input in AdminTable
    const searchInput = page.getByPlaceholder('Rechercher un jeune...')
    await expect(searchInput).toBeVisible()

    // Search for "Jean"
    await searchInput.fill('Jean')

    // Only Jean Test should be visible
    await expect(page.getByText('Jean Test')).toBeVisible()

    // Others should not be visible
    await expect(page.getByText('Marie Test')).not.toBeVisible()
    await expect(page.getByText('Lucas Test')).not.toBeVisible()
    await expect(page.getByText('Emma Test')).not.toBeVisible()
  })

  test('should navigate to jeune detail', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // Click on Jean Test row (the row is clickable via rowLink)
    await page.getByText('Jean Test').click()

    // Should navigate to the detail page
    await page.waitForURL(/\/espace\/jeunes\//)
    await expect(page.getByText('Jean')).toBeVisible()
    await expect(page.getByText('Retour a la liste')).toBeVisible()
  })

  test('should delete a jeune with confirmation', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // First add a jeune to delete (so we don't destroy seed data)
    await page.getByRole('button', { name: 'Ajouter' }).click()
    const form = page.locator('form')
    await form.locator('input[type="text"]').first().fill('ASupprimer')
    await form.locator('input[type="text"]').nth(1).fill('DeleteTest')
    await form.locator('select').last().selectOption({ label: 'Autre' })

    const dobSection = form.locator('text=Date de naissance').locator('..')
    const dobInput = dobSection.locator('input, select').first()
    if (await dobInput.isVisible()) {
      const tagName = await dobInput.evaluate(el => el.tagName.toLowerCase())
      if (tagName === 'input') {
        await dobInput.fill('2005-01-01')
      }
    }

    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText('Fiche jeune creee')).toBeVisible({ timeout: 10000 })

    // Now find the delete button for this jeune
    const row = page.locator('tr').filter({ hasText: 'ASupprimer DeleteTest' })
    await expect(row).toBeVisible()

    // Click the delete button (Trash2 icon)
    await row.locator('button[title="Supprimer"]').click()

    // Confirmation dialog should appear
    await expect(page.getByText('Confirmation')).toBeVisible()
    await expect(page.getByText('Supprimer la fiche de')).toBeVisible()

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirmer' }).click()

    // Success toast
    await expect(page.getByText('Fiche supprimee')).toBeVisible({ timeout: 10000 })

    // Jeune should no longer be visible
    await expect(page.getByText('ASupprimer DeleteTest')).not.toBeVisible()
  })

  test('should export CSV', async ({ page }) => {
    await expect(page.getByText('Mes jeunes')).toBeVisible()

    // CSV export button should be visible
    const exportButton = page.getByRole('button', { name: /CSV/ })
    await expect(exportButton).toBeVisible()

    // Listen for download event
    const downloadPromise = page.waitForEvent('download')
    await exportButton.click()
    const download = await downloadPromise

    // Verify the filename
    expect(download.suggestedFilename()).toBe('jeunes.csv')
  })
})
