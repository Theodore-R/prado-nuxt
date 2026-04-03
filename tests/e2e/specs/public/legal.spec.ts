import { test, expect } from '@playwright/test'

test.describe('Legal pages', () => {
  test('should load mentions legales', async ({ page }) => {
    await page.goto('/mentions-legales', { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible()
    // Page should have some text content
    const text = await page.locator('main').textContent()
    expect(text!.length).toBeGreaterThan(50)
  })

  test('should load politique de confidentialite', async ({ page }) => {
    await page.goto('/politique-confidentialite', { waitUntil: 'networkidle' })
    await expect(page.locator('main')).toBeVisible()
    const text = await page.locator('main').textContent()
    expect(text!.length).toBeGreaterThan(50)
  })
})
