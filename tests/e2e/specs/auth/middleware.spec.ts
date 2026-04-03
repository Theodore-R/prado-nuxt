import { test, expect } from '@playwright/test'

/**
 * Auth middleware E2E tests.
 *
 * Validates that:
 *   - Unauthenticated users are redirected to /connexion
 *   - Role-based access control works (prescripteur blocked from /admin)
 *   - Status banners display for pending / rejected prescripteurs
 */

test.describe('Middleware - unauthenticated redirects', () => {
  test('should redirect unauthenticated user from /espace to /connexion', async ({ page }) => {
    await page.goto('/espace', { waitUntil: 'networkidle' })

    await page.waitForURL(/\/connexion/, { timeout: 10_000 })
    expect(page.url()).toContain('/connexion')
  })

  test('should redirect unauthenticated user from /admin to /connexion', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    await page.waitForURL(/\/connexion/, { timeout: 10_000 })
    expect(page.url()).toContain('/connexion')
  })
})

test.describe('Middleware - prescripteur cannot access admin', () => {
  test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

  test('should redirect prescripteur from /admin to /connexion', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'networkidle' })

    // Admin middleware redirects non-admin to /connexion
    await page.waitForURL(/\/connexion/, { timeout: 10_000 })
    expect(page.url()).toContain('/connexion')
  })
})

test.describe('Middleware - pending prescripteur status banner', () => {
  test.use({ storageState: 'tests/e2e/.auth/prescripteur-pending.json' })

  test('should show pending banner for pending prescripteur', async ({ page }) => {
    await page.goto('/espace', { waitUntil: 'networkidle' })

    // The pending banner should be visible on the dashboard
    await expect(
      page.getByText('en attente de validation'),
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Middleware - rejected prescripteur status banner', () => {
  // TODO: Add a prescripteurRejected user to tests/e2e/helpers/seed.ts
  // and a corresponding storage state in tests/e2e/helpers/auth.ts.
  // Then uncomment the test.use line and remove test.skip.

  // test.use({ storageState: 'tests/e2e/.auth/prescripteur-rejected.json' })

  test('should show rejected banner for rejected prescripteur', async ({ page }) => {
    test.skip(true, 'Requires a rejected test user to be added to seed data')

    await page.goto('/espace', { waitUntil: 'networkidle' })

    await expect(
      page.getByText('demande de compte a ete refusee'),
    ).toBeVisible({ timeout: 10_000 })
  })
})
