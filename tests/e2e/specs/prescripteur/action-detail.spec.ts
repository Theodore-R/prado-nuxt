import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Action Detail', () => {
  /**
   * Navigate to the E2E Action Publiee detail page by going through the catalog.
   * This avoids hardcoding numeric IDs that change between seed runs.
   */
  async function navigateToPublishedAction(page: import('@playwright/test').Page) {
    await page.goto('/espace/actions', { waitUntil: 'networkidle' })
    await expect(page.getByText('E2E Action Publiee')).toBeVisible()
    await page.getByText('E2E Action Publiee').click()
    await page.waitForURL(/\/espace\/actions\/\d+/)
  }

  test('should display action detail', async ({ page }) => {
    await navigateToPublishedAction(page)

    // Title
    await expect(page.getByRole('heading', { name: 'E2E Action Publiee' })).toBeVisible()

    // Category tag
    await expect(page.getByText('Sport')).toBeVisible()

    // Description
    await expect(page.getByText('Description test')).toBeVisible()

    // Practical info section
    await expect(page.getByText('Informations pratiques')).toBeVisible()

    // Back link
    await expect(page.getByText('Retour aux actions')).toBeVisible()
  })

  test('should show enrollment section', async ({ page }) => {
    await navigateToPublishedAction(page)

    // Jean and Marie are already enrolled (from seed data)
    // The enrollment section should show "Jeunes inscrits" with count
    await expect(page.getByText(/Jeunes inscrits/)).toBeVisible()

    // Jean Test and Marie Test should appear as enrolled
    await expect(page.getByText('Jean Test')).toBeVisible()
    await expect(page.getByText('Marie Test')).toBeVisible()
  })

  test('should enroll a jeune', async ({ page }) => {
    await navigateToPublishedAction(page)

    // Jean and Marie are already enrolled. Lucas and Emma are not.
    // Click "Ajouter" to show the enrollment picker
    const addButton = page.getByRole('button', { name: 'Ajouter' })
    if (await addButton.isVisible()) {
      await addButton.click()

      // Should see unenrolled jeunes (Lucas Test, Emma Test)
      await expect(page.getByText('Lucas Test')).toBeVisible()

      // Click "Inscrire" for Lucas Test
      const lucasRow = page.locator('button').filter({ hasText: 'Lucas Test' })
      await lucasRow.click()

      // Success toast
      await expect(page.getByText('Inscription confirmee')).toBeVisible({ timeout: 10000 })

      // Lucas should now appear in the enrolled list
      await expect(
        page.locator('a').filter({ hasText: 'Lucas Test' }),
      ).toBeVisible()

      // Clean up: unenroll Lucas (click "Retirer")
      const lucasEnrolled = page.locator('div').filter({ hasText: 'Lucas Test' }).locator('button', { hasText: 'Retirer' })
      if (await lucasEnrolled.isVisible()) {
        await lucasEnrolled.click()
        await expect(page.getByText('Inscription annulee')).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('should show action not found for invalid ID', async ({ page }) => {
    await page.goto('/espace/actions/999999', { waitUntil: 'networkidle' })

    await expect(page.getByText('Action non trouvee')).toBeVisible()
    await expect(page.getByText('Retour aux actions')).toBeVisible()
  })
})
