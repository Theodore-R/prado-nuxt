import { test, expect } from '@playwright/test'

test.describe('Unauthorized access', () => {
  test('should redirect unauthenticated user from /espace to /connexion', async ({ page }) => {
    await page.goto('/espace')
    await page.waitForURL(/\/connexion/, { timeout: 5000 })
    expect(page.url()).toContain('/connexion')
  })

  test('should redirect unauthenticated user from /admin to /connexion', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/\/connexion/, { timeout: 5000 })
    expect(page.url()).toContain('/connexion')
  })
})

test.describe('Wrong role access', () => {
  test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

  test('should redirect prescripteur from /admin', async ({ page }) => {
    await page.goto('/admin')
    // Should be redirected away from admin
    await page.waitForTimeout(3000)
    expect(page.url()).not.toMatch(/\/admin$/)
  })
})
