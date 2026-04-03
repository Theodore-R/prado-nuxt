import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Inscriptions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace/inscriptions', { waitUntil: 'networkidle' })
  })

  test('should display inscriptions table', async ({ page }) => {
    // Page heading
    await expect(page.getByText('Inscriptions', { exact: true })).toBeVisible()

    // Table columns
    await expect(page.getByText('Jeune')).toBeVisible()
    await expect(page.getByText('Action')).toBeVisible()

    // Seeded inscriptions: Jean Test and Marie Test enrolled in E2E Action Publiee
    // They should appear in the table
    await expect(page.getByText('Jean Test')).toBeVisible()
    await expect(page.getByText('Marie Test')).toBeVisible()
    await expect(page.getByText('E2E Action Publiee').first()).toBeVisible()
  })

  test('should filter by jeune', async ({ page }) => {
    await expect(page.getByText('Inscriptions', { exact: true })).toBeVisible()

    // The jeune filter dropdown contains "Tous les jeunes" and each jeune
    const jeuneSelect = page.locator('select').filter({ hasText: 'Tous les jeunes' })
    await expect(jeuneSelect).toBeVisible()

    // Select Jean Test
    await jeuneSelect.selectOption({ label: 'Jean Test' })

    // Only Jean Test's inscription should be visible
    await expect(page.getByText('Jean Test')).toBeVisible()
    await expect(page.getByText('Marie Test')).not.toBeVisible()

    // Reset filter
    await jeuneSelect.selectOption({ label: 'Tous les jeunes' })
    await expect(page.getByText('Marie Test')).toBeVisible()
  })

  test('should filter by year', async ({ page }) => {
    await expect(page.getByText('Inscriptions', { exact: true })).toBeVisible()

    // The year filter dropdown
    const yearSelect = page.locator('select').filter({ hasText: String(new Date().getFullYear()) })
    await expect(yearSelect).toBeVisible()

    // Select a past year where no inscriptions exist
    const pastYear = String(new Date().getFullYear() - 3)
    await yearSelect.selectOption(pastYear)

    // No inscriptions should match
    await expect(page.getByText('Aucune inscription')).toBeVisible()

    // Reset to current year
    await yearSelect.selectOption(String(new Date().getFullYear()))
  })
})
