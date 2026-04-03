import { seedAll } from '../helpers/seed'
import { createAuthStates } from '../helpers/auth'

export default async function globalSetup() {
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

  console.log(`[Global Setup] Base URL: ${baseURL}`)

  // Step 1: Seed test data
  await seedAll()

  // Step 2: Create auth storage states via UI login
  await createAuthStates(baseURL)

  console.log('[Global Setup] Complete!')
}
