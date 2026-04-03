import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/prescripteur-approved.json' })

test.describe('Prescripteur - Parametres', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/espace/parametres', { waitUntil: 'networkidle' })
  })

  test('should display all 4 settings sections', async ({ page }) => {
    // Page heading
    await expect(page.getByText('Parametres')).toBeVisible()

    // Section 1: Profile (Informations personnelles)
    await expect(page.getByText('Informations personnelles')).toBeVisible()

    // Section 2: Security (Securite)
    await expect(page.getByText('Securite')).toBeVisible()

    // Section 3: Notifications
    await expect(page.getByText('Notifications')).toBeVisible()

    // Section 4: Account (Compte)
    await expect(page.getByText('Compte')).toBeVisible()
  })

  test('should update profile name', async ({ page }) => {
    await expect(page.getByText('Informations personnelles')).toBeVisible()

    // Profile form should have first name and last name inputs
    const profileSection = page.locator('div').filter({ hasText: 'Informations personnelles' }).first()

    // Find the Prenom input (first text input in the profile form)
    const firstNameInput = page.locator('input[autocomplete="given-name"]')
    await expect(firstNameInput).toBeVisible()

    // Store original value
    const originalFirstName = await firstNameInput.inputValue()

    // Update first name
    await firstNameInput.clear()
    await firstNameInput.fill('PrescripteurModifie')

    // Submit the form
    await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()

    // Wait for success toast
    await expect(page.getByText('Profil mis a jour')).toBeVisible({ timeout: 10000 })

    // Revert back to original name
    await firstNameInput.clear()
    await firstNameInput.fill(originalFirstName)
    await page.getByRole('button', { name: 'Enregistrer les modifications' }).click()
    await expect(page.getByText('Profil mis a jour')).toBeVisible({ timeout: 10000 })
  })

  test('should change password (validation test)', async ({ page }) => {
    await expect(page.getByText('Securite')).toBeVisible()

    // Click "Changer le mot de passe" to show the form
    await page.getByText('Changer le mot de passe').click()

    // Password form should appear
    const newPasswordInput = page.locator('input[type="password"]').first()
    const confirmPasswordInput = page.locator('input[type="password"]').nth(1)
    await expect(newPasswordInput).toBeVisible()
    await expect(confirmPasswordInput).toBeVisible()

    // Test validation: mismatching passwords
    await newPasswordInput.fill('NewPass123!')
    await confirmPasswordInput.fill('DifferentPass!')
    await page.getByRole('button', { name: 'Modifier le mot de passe' }).click()

    // Should show error toast about mismatch
    await expect(page.getByText('Les mots de passe ne correspondent pas')).toBeVisible({ timeout: 5000 })

    // Test validation: too short password
    await newPasswordInput.clear()
    await newPasswordInput.fill('short')
    await confirmPasswordInput.clear()
    await confirmPasswordInput.fill('short')
    await page.getByRole('button', { name: 'Modifier le mot de passe' }).click()

    // Should show error about minimum length
    await expect(page.getByText('au moins 6 caracteres')).toBeVisible({ timeout: 5000 })

    // Cancel to close the form
    await page.getByText('Annuler').click()
    await expect(newPasswordInput).not.toBeVisible()
  })

  test('should display account status', async ({ page }) => {
    // Account section should show status
    await expect(page.getByText('Compte')).toBeVisible()

    // Status should be "Approuve" for the approved prescripteur
    await expect(page.getByText('Approuve')).toBeVisible()

    // "Membre depuis" field
    await expect(page.getByText('Membre depuis')).toBeVisible()

    // Download data button
    await expect(page.getByRole('button', { name: /Telecharger mes donnees/ })).toBeVisible()

    // Delete account button (danger zone)
    await expect(page.getByText('Zone de danger')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Supprimer mon compte' })).toBeVisible()
  })
})
