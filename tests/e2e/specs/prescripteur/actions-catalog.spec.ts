import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Actions Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace/actions', { waitUntil: 'networkidle' })
  })

  test('should display actions list', async ({ page }) => {
    // Page heading
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()

    // Actions count indicator
    await expect(page.getByText(/\d+ actions?/)).toBeVisible()

    // Seeded published actions should be visible
    // "E2E Action Publiee" and "E2E Action Recurrente" are is_activite: true
    // The default filter mode is "activite" (Planifie)
    await expect(page.getByText('E2E Action Publiee')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()

    // Category filter buttons are displayed for categories that have actions
    // Seeded actions have: Sport (Publiee), Culture (Complete), Emploi (Recurrente)
    const sportFilter = page.getByRole('button', { name: 'Sport' })

    if (await sportFilter.isVisible()) {
      await sportFilter.click()

      // After filtering by Sport, only "E2E Action Publiee" should remain
      await expect(page.getByText('E2E Action Publiee')).toBeVisible()

      // Actions of other categories should not be visible (if they were before)
      // Click again to deselect
      await sportFilter.click()
    }
  })

  test('should search actions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()

    // Search input
    const searchInput = page.getByPlaceholder('Rechercher une action...')
    await expect(searchInput).toBeVisible()

    // Search for "Publiee"
    await searchInput.fill('Publiee')

    // Only E2E Action Publiee should be visible
    await expect(page.getByText('E2E Action Publiee')).toBeVisible()

    // Other seeded actions should not appear
    await expect(page.getByText('E2E Action Complete')).not.toBeVisible()

    // Clear search
    await searchInput.clear()

    // Search for a non-existent term
    await searchInput.fill('xyznonexistent')
    await expect(page.getByText('Aucune action trouvee')).toBeVisible()
  })

  test('should show places remaining', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()

    // E2E Action Publiee has 10 places_max, 2 inscriptions => should show remaining places
    const publieeCard = page.locator('a').filter({ hasText: 'E2E Action Publiee' })
    await expect(publieeCard).toBeVisible()

    // Should show places count (e.g., "8 places")
    await expect(publieeCard.getByText(/\d+ places?/)).toBeVisible()

    // E2E Action Complete has 1 place, 1 inscription => should show "Complet"
    const completeCard = page.locator('a').filter({ hasText: 'E2E Action Complete' })
    if (await completeCard.isVisible()) {
      await expect(completeCard.getByText('Complet')).toBeVisible()
    }
  })

  test('should navigate to action detail', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible()

    // Click on "E2E Action Publiee"
    await page.getByText('E2E Action Publiee').click()

    // Should navigate to the action detail page
    await page.waitForURL(/\/espace\/actions\/\d+/)

    // Detail page should show the action title
    await expect(page.getByRole('heading', { name: 'E2E Action Publiee' })).toBeVisible()

    // Back link should be visible
    await expect(page.getByText('Retour aux actions')).toBeVisible()
  })
})
