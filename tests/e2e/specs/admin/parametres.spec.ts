import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Admin Parametres', () => {
  test('should display 5 tabs', async ({ page }) => {
    await page.goto('/admin/parametres', { waitUntil: 'networkidle' })

    await expect(page.getByText('Parametres', { exact: false })).toBeVisible()

    // Verify all 5 tabs are displayed
    const expectedTabs = [
      'Email & Notifications',
      'Newsletter & Mailchimp',
      'CMS (Prismic)',
      'Analytics',
      'Informations de contact',
    ]

    for (const tab of expectedTabs) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/admin/parametres', { waitUntil: 'networkidle' })

    // Email tab should be active by default (has border-prado-sage)
    const emailTab = page.getByRole('button', { name: 'Email & Notifications' })
    await expect(emailTab).toHaveClass(/border-prado-sage/)

    // Click Newsletter tab
    const newsletterTab = page.getByRole('button', { name: 'Newsletter & Mailchimp' })
    await newsletterTab.click()
    await expect(newsletterTab).toHaveClass(/border-prado-sage/)

    // Click CMS tab
    const cmsTab = page.getByRole('button', { name: 'CMS (Prismic)' })
    await cmsTab.click()
    await expect(cmsTab).toHaveClass(/border-prado-sage/)

    // Click Analytics tab
    const analyticsTab = page.getByRole('button', { name: 'Analytics' })
    await analyticsTab.click()
    await expect(analyticsTab).toHaveClass(/border-prado-sage/)

    // Click Contact tab
    const contactTab = page.getByRole('button', { name: 'Informations de contact' })
    await contactTab.click()
    await expect(contactTab).toHaveClass(/border-prado-sage/)
  })
})
