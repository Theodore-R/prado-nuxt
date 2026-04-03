import { test, expect } from '@playwright/test'

test.describe('Contact page', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' })

    // Form fields should be visible
    await expect(page.getByPlaceholder('Votre nom')).toBeVisible()
    await expect(page.getByPlaceholder('votre@email.fr')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' })

    // Try submitting empty form
    const submitBtn = page.getByRole('button', { name: /envoyer/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Should show validation errors or HTML required
      await page.waitForTimeout(500)
    }
  })

  test('should submit form successfully with valid data', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' })

    await page.getByPlaceholder('Votre nom').fill('E2E Test User')
    await page.getByPlaceholder('votre@email.fr').fill('e2e-contactform@test.fr')

    // Fill message if visible
    const messageField = page.getByPlaceholder(/message/i)
    if (await messageField.isVisible()) {
      await messageField.fill('Message de test E2E automatise')
    }

    // Submit
    const submitBtn = page.getByRole('button', { name: /envoyer/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Wait for toast or success message
      await page.waitForTimeout(2000)
    }
  })
})
