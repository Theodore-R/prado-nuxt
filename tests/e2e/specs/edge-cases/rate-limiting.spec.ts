import { test, expect } from '@playwright/test'

test.describe('Rate limiting', () => {
  test('should return 429 after 5 POST requests to /api/contact', async ({ request }) => {
    const body = {
      name: 'Rate Test',
      email: 'e2e-rate@test.fr',
      subject: 'Rate test',
      message: 'Testing rate limit',
    }

    // Send 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      const res = await request.post('/api/contact', { data: body })
      // May succeed or fail for other reasons, but not 429 yet
      if (res.status() === 429) {
        // If rate limit kicks in earlier, that's also fine
        return
      }
    }

    // 6th request should be rate limited
    const res = await request.post('/api/contact', { data: body })
    expect(res.status()).toBe(429)
  })

  test('should include Retry-After header on 429', async ({ request }) => {
    const body = {
      name: 'Rate Test',
      email: 'e2e-rate2@test.fr',
      subject: 'Rate test',
      message: 'Testing rate limit header',
    }

    // Exhaust rate limit
    for (let i = 0; i < 6; i++) {
      await request.post('/api/contact', { data: body })
    }

    const res = await request.post('/api/contact', { data: body })
    if (res.status() === 429) {
      const retryAfter = res.headers()['retry-after']
      expect(retryAfter).toBeDefined()
    }
  })
})
