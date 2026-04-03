/**
 * Authentication helpers for E2E tests.
 * Generates storageState files by logging in via Supabase.
 */
import { chromium, type Browser } from '@playwright/test'
import { TEST_USERS } from './seed'

const AUTH_DIR = 'tests/e2e/.auth'

interface AuthUser {
  email: string
  password: string
  storageStatePath: string
}

export const AUTH_STATES = {
  admin: {
    ...TEST_USERS.admin,
    storageStatePath: `${AUTH_DIR}/admin.json`,
  },
  prescripteurApproved: {
    ...TEST_USERS.prescripteurApproved,
    storageStatePath: `${AUTH_DIR}/prescripteur-approved.json`,
  },
  prescripteurPending: {
    ...TEST_USERS.prescripteurPending,
    storageStatePath: `${AUTH_DIR}/prescripteur-pending.json`,
  },
}

/**
 * Login via UI and save the browser storage state.
 */
async function loginAndSaveState(browser: Browser, user: AuthUser, baseURL: string) {
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(`${baseURL}/connexion`, { waitUntil: 'networkidle' })

    // Step 1: Enter email
    await page.getByPlaceholder('votre@email-pro.fr').fill(user.email)
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Step 2: Enter password
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 5000 })
    await page.getByPlaceholder('••••••••').fill(user.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Wait for redirect (admin → /admin, prescripteur → /espace)
    await page.waitForURL(/\/(admin|espace)/, { timeout: 10000 })

    // Save storage state
    await context.storageState({ path: user.storageStatePath })
    console.log(`[Auth] Saved state for ${user.email} → ${user.storageStatePath}`)
  } finally {
    await context.close()
  }
}

/**
 * Create all auth storage states.
 * Called from global-setup.
 */
export async function createAuthStates(baseURL: string) {
  const browser = await chromium.launch()

  try {
    for (const [name, user] of Object.entries(AUTH_STATES)) {
      try {
        await loginAndSaveState(browser, user, baseURL)
      } catch (err) {
        console.error(`[Auth] Failed to create state for ${name}:`, err)
        throw err
      }
    }
  } finally {
    await browser.close()
  }
}
