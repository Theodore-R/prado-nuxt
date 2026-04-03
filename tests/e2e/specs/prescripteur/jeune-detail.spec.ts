import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Jeune Detail', () => {
  /**
   * Navigate to a known jeune detail page by going through the list first.
   * This avoids hardcoding UUIDs that change between seed runs.
   */
  async function navigateToJeanDetail(page: import('@playwright/test').Page) {
    await page.goto('/espace/jeunes', { waitUntil: 'networkidle' })
    await expect(page.getByText('Jean Test')).toBeVisible()
    await page.getByText('Jean Test').click()
    await page.waitForURL(/\/espace\/jeunes\//)
    await expect(page.getByText('Retour a la liste')).toBeVisible()
  }

  test('should display all jeune fields', async ({ page }) => {
    await navigateToJeanDetail(page)

    // Heading with the jeune name
    await expect(page.locator('h1').filter({ hasText: 'Jean' })).toBeVisible()
    await expect(page.locator('h1').filter({ hasText: 'Test' })).toBeVisible()

    // Fields section
    await expect(page.getByText('Prenom')).toBeVisible()
    await expect(page.getByText('Nom', { exact: true })).toBeVisible()
    await expect(page.getByText('Sexe')).toBeVisible()
    await expect(page.getByText('Date de naissance')).toBeVisible()
    await expect(page.getByText('Situation')).toBeVisible()
    await expect(page.getByText('QPV')).toBeVisible()
    await expect(page.getByText('Accompagnement au titre de')).toBeVisible()

    // Notes section
    await expect(page.getByText('Notes internes')).toBeVisible()
  })

  test('should inline edit first name', async ({ page }) => {
    await navigateToJeanDetail(page)

    // Find the Prenom field row and click the edit (Pencil) button
    const prenomRow = page.locator('div').filter({ hasText: /^Prenom$/ }).locator('..')
    const editButton = prenomRow.locator('button').last()
    await editButton.click()

    // Input should appear with the current value
    const input = prenomRow.locator('input')
    await expect(input).toBeVisible()

    // Clear and type new value
    await input.clear()
    await input.fill('JeanModifie')

    // Save (click the check button)
    const saveButton = prenomRow.locator('button').first()
    await saveButton.click()

    // Wait for success toast
    await expect(page.getByText('Modification enregistree')).toBeVisible({ timeout: 10000 })

    // Revert the name back to avoid polluting other tests
    const editButtonAgain = prenomRow.locator('button').last()
    await editButtonAgain.click()
    const inputAgain = prenomRow.locator('input')
    await inputAgain.clear()
    await inputAgain.fill('Jean')
    const saveAgain = prenomRow.locator('button').first()
    await saveAgain.click()
    await expect(page.getByText('Modification enregistree')).toBeVisible({ timeout: 10000 })
  })

  test('should inline edit situation', async ({ page }) => {
    await navigateToJeanDetail(page)

    // Find the Situation field row
    const situationRow = page.locator('div.flex.items-center').filter({ hasText: 'Situation' })
    const editButton = situationRow.locator('button').last()
    await editButton.click()

    // A select should appear for situation editing
    const select = situationRow.locator('select')
    await expect(select).toBeVisible()

    // Change to "Emploi / Formation"
    await select.selectOption('emploi_formation')

    // Save
    const saveButton = situationRow.locator('button').first()
    await saveButton.click()

    await expect(page.getByText('Modification enregistree')).toBeVisible({ timeout: 10000 })

    // The display value should now show "Emploi / Formation"
    await expect(situationRow.getByText('Emploi / Formation')).toBeVisible()

    // Revert back to original
    const editAgain = situationRow.locator('button').last()
    await editAgain.click()
    const selectAgain = situationRow.locator('select')
    await selectAgain.selectOption('sans_emploi')
    const saveAgain = situationRow.locator('button').first()
    await saveAgain.click()
    await expect(page.getByText('Modification enregistree')).toBeVisible({ timeout: 10000 })
  })

  test('should save notes', async ({ page }) => {
    await navigateToJeanDetail(page)

    // Notes section
    const notesSection = page.locator('div').filter({ hasText: 'Notes internes' }).first()

    // Click the edit button or "Aucune note" text to start editing
    const noNotesText = page.getByText('Aucune note')
    const editPencil = notesSection.locator('button').first()

    if (await noNotesText.isVisible()) {
      await noNotesText.click()
    } else {
      await editPencil.click()
    }

    // Textarea should appear
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // Type notes
    await textarea.fill('Note de test E2E pour Jean')

    // Click "Enregistrer"
    await page.getByRole('button', { name: 'Enregistrer' }).click()

    // Success toast
    await expect(page.getByText('Notes enregistrees')).toBeVisible({ timeout: 10000 })

    // Notes should be displayed
    await expect(page.getByText('Note de test E2E pour Jean')).toBeVisible()

    // Clean up: clear the notes
    await notesSection.locator('button').first().click()
    const textareaClean = page.locator('textarea')
    await textareaClean.clear()
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(page.getByText('Notes enregistrees')).toBeVisible({ timeout: 10000 })
  })

  test('should show inscriptions list', async ({ page }) => {
    await navigateToJeanDetail(page)

    // Jean Test has one inscription to E2E Action Publiee (from seed)
    await expect(page.getByText(/Inscriptions/)).toBeVisible()

    // The inscription to "E2E Action Publiee" should appear
    await expect(page.getByText('E2E Action Publiee')).toBeVisible()

    // "Inscrire a une action" button should be visible
    await expect(page.getByRole('button', { name: /Inscrire/ })).toBeVisible()
  })

  test('should show not found for invalid ID', async ({ page }) => {
    await page.goto('/espace/jeunes/00000000-0000-0000-0000-000000000000', {
      waitUntil: 'networkidle',
    })

    await expect(page.getByText('Jeune introuvable')).toBeVisible()
    await expect(page.getByText('Retour')).toBeVisible()
  })
})
