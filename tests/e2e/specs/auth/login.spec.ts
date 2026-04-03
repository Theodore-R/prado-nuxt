import { test, expect } from '@playwright/test'

/**
 * Login flow E2E tests.
 *
 * These tests run unauthenticated (no storageState) and exercise
 * the multi-step login page at /connexion:
 *   1. Email check step (entry point)
 *   2. Password step (known user)
 *   3. Forgot-password form
 *   4. Navigation between steps
 *   5. Post-login redirect by role
 */

const TEST_USERS = {
  admin: { email: 'e2e-test-admin@prado-test.fr', password: 'TestPass123!' },
  prescripteurApproved: { email: 'e2e-test-prescripteur@prado-test.fr', password: 'TestPass123!' },
}

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connexion', { waitUntil: 'networkidle' })
  })

  test('should show email step by default', async ({ page }) => {
    // The email input and "Continuer" button should be visible
    await expect(page.getByPlaceholder('votre@email-pro.fr')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeVisible()

    // Password input should NOT be visible yet
    await expect(page.getByPlaceholder('••••••••')).not.toBeVisible()
  })

  test('should redirect known email to password step', async ({ page }) => {
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Should transition to password step
    await expect(page.getByPlaceholder('••••••••')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()

    // Email should be shown in the greeting
    await expect(page.getByText(TEST_USERS.admin.email)).toBeVisible()
  })

  test('should login admin and redirect to /admin', async ({ page }) => {
    // Step 1: email
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Step 2: password
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })
    await page.getByPlaceholder('••••••••').fill(TEST_USERS.admin.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Should redirect to /admin
    await page.waitForURL(/\/admin/, { timeout: 15_000 })
    expect(page.url()).toContain('/admin')
  })

  test('should login prescripteur and redirect to /espace', async ({ page }) => {
    // Step 1: email
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.prescripteurApproved.email)
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Step 2: password
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })
    await page.getByPlaceholder('••••••••').fill(TEST_USERS.prescripteurApproved.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Should redirect to /espace
    await page.waitForURL(/\/espace/, { timeout: 15_000 })
    expect(page.url()).toContain('/espace')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    // Step 1: email
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()

    // Step 2: wrong password
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })
    await page.getByPlaceholder('••••••••').fill('WrongPassword999!')
    await page.getByRole('button', { name: 'Se connecter' }).click()

    // Should show error toast
    await expect(page.getByText('Email ou mot de passe incorrect')).toBeVisible({ timeout: 5_000 })

    // Should stay on /connexion
    expect(page.url()).toContain('/connexion')
  })

  test('should show forgot password form', async ({ page }) => {
    // Navigate to password step first
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })

    // Click "Mot de passe oublie ?"
    await page.getByText('Mot de passe oubli').click()

    // Should show the forgot password form
    await expect(page.getByText('Mot de passe oubli', { exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'initialiser' })).toBeVisible()
  })

  test('should navigate back to email step', async ({ page }) => {
    // Navigate to password step
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })

    // Click back button "Changer d'email"
    await page.getByText("Changer d'email").click()

    // Should return to email step
    await expect(page.getByPlaceholder('votre@email-pro.fr')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeVisible()
  })

  test('should redirect already-authenticated user', async ({ page }) => {
    // Login first
    await page.getByPlaceholder('votre@email-pro.fr').fill(TEST_USERS.admin.email)
    await page.getByRole('button', { name: 'Continuer' }).click()
    await page.getByPlaceholder('••••••••').waitFor({ timeout: 10_000 })
    await page.getByPlaceholder('••••••••').fill(TEST_USERS.admin.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL(/\/admin/, { timeout: 15_000 })

    // Now go back to /connexion while authenticated
    await page.goto('/connexion', { waitUntil: 'networkidle' })

    // Should be redirected away from /connexion (back to /admin)
    await page.waitForURL(/\/admin/, { timeout: 10_000 })
    expect(page.url()).toContain('/admin')
  })
})
