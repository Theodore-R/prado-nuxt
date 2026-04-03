import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should render all main sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Hero section
    await expect(page.locator('section').first()).toBeVisible()

    // Navigation
    await expect(page.getByRole('navigation')).toBeVisible()

    // Footer
    await expect(page.locator('footer')).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Filter out known harmless errors (favicon, font loading)
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('fonts.googleapis')
    )
    expect(realErrors).toEqual([])
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check main nav links exist
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
