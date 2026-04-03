import { test, expect } from '@playwright/test'

/**
 * Visits every route and asserts zero console errors.
 * Uses admin auth state for protected routes.
 */

const PUBLIC_ROUTES = [
  '/',
  '/connexion',
  '/contact',
  '/documents',
  '/foodtruck',
  '/fresque',
  '/educolab',
  '/mentions-legales',
  '/politique-confidentialite',
  '/actions',
  '/actualites',
  '/ressources',
]

const ADMIN_ROUTES = [
  '/admin',
  '/admin/actions',
  '/admin/structures',
  '/admin/etablissements',
  '/admin/prescripteurs',
  '/admin/inscriptions',
  '/admin/jeunes',
  '/admin/contacts',
  '/admin/newsletter',
  '/admin/statistiques',
  '/admin/budget',
  '/admin/parametres',
]

const ESPACE_ROUTES = [
  '/espace',
  '/espace/jeunes',
  '/espace/actions',
  '/espace/inscriptions',
  '/espace/parametres',
  '/espace/ressources',
]

test.describe('Console errors - public pages', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} should have zero console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text()
          // Ignore known harmless errors
          if (text.includes('favicon') || text.includes('Failed to load resource: net::ERR_')) return
          errors.push(text)
        }
      })

      await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(1000)

      expect(errors, `Console errors on ${route}`).toEqual([])
    })
  }
})

test.describe('Console errors - admin pages', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin.json' })

  for (const route of ADMIN_ROUTES) {
    test(`${route} should have zero console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (text.includes('favicon') || text.includes('Failed to load resource: net::ERR_')) return
          errors.push(text)
        }
      })

      await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(1000)

      expect(errors, `Console errors on ${route}`).toEqual([])
    })
  }
})

test.describe('Console errors - espace pages', () => {
  test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

  for (const route of ESPACE_ROUTES) {
    test(`${route} should have zero console errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text()
          if (text.includes('favicon') || text.includes('Failed to load resource: net::ERR_')) return
          errors.push(text)
        }
      })

      await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(1000)

      expect(errors, `Console errors on ${route}`).toEqual([])
    })
  }
})
