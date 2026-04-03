import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  timeout: 30_000,

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3006',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  globalSetup: './tests/e2e/setup/global-setup.ts',
  globalTeardown: './tests/e2e/setup/global-teardown.ts',

  projects: [
    // Setup project: creates auth storage states
    {
      name: 'setup',
      testMatch: /global-auth\.setup\.ts/,
    },

    // Admin tests (pre-authenticated)
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /specs\/admin\//,
    },

    // Prescripteur tests (pre-authenticated, approved)
    {
      name: 'prescripteur',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/prescripteur-approved.json',
      },
      dependencies: ['setup'],
      testMatch: /specs\/prescripteur\//,
    },

    // Unauthenticated tests (auth flows, public pages, edge cases)
    {
      name: 'unauthenticated',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
      testMatch: /specs\/(auth|public|edge-cases|health)\//,
    },
  ],
})
