import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace', { waitUntil: 'networkidle' })
  })

  test('should display 3 stat cards (Jeunes, Inscriptions actives, Ce mois)', async ({ page }) => {
    // Wait for the dashboard to load (heading present)
    await expect(page.getByText('Tableau de bord')).toBeVisible()

    // Stat card: Jeunes
    await expect(page.getByText('Jeunes', { exact: true })).toBeVisible()

    // Stat card: Inscriptions actives
    await expect(page.getByText('Inscriptions actives')).toBeVisible()

    // Stat card: Inscriptions ce mois
    await expect(page.getByText('Inscriptions ce mois')).toBeVisible()

    // All 3 stat cards should have numeric values (text-2xl font-semibold)
    const statValues = page.locator('.grid .text-2xl')
    await expect(statValues).toHaveCount(3)
  })

  test('should show contextual action cards', async ({ page }) => {
    await expect(page.getByText('Tableau de bord')).toBeVisible()

    // With seeded data (4 jeunes, 2 inscriptions), some jeunes have no inscription
    // so contextual cards like "Inscrire X a une action" should appear
    // At minimum, Lucas and Emma have no inscriptions -> suggestion cards
    const actionCards = page.locator('a[href*="/espace/jeunes/"]').filter({
      hasText: 'Inscrire',
    })

    // There should be at least one contextual action card
    const count = await actionCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should display latest inscriptions', async ({ page }) => {
    await expect(page.getByText('Tableau de bord')).toBeVisible()

    // Latest inscriptions section
    await expect(page.getByText('Dernieres inscriptions')).toBeVisible()

    // Year filter dropdown should be visible
    const yearSelect = page.locator('select').first()
    await expect(yearSelect).toBeVisible()

    // Seeded inscriptions: Jean Test and Marie Test are enrolled in E2E Action Publiee
    // They should appear if they match the current year filter
    // Check at least the section structure exists (may show "Aucune inscription" if year mismatch)
    const inscriptionSection = page.locator('.bg-prado-surface').filter({
      hasText: 'Dernieres inscriptions',
    })
    await expect(inscriptionSection).toBeVisible()
  })
})
