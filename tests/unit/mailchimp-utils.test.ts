import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Tests for syncToMailchimp logic from server/utils/mailchimp.ts.
 * We reproduce the core logic and mock external dependencies (getSettings, fetch).
 */

import crypto from 'node:crypto'

interface MailchimpConfig {
  mailchimpEnabled?: boolean
  mailchimpApiKey?: string
  mailchimpServer?: string
  mailchimpListId?: string
}

function md5Hash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex')
}

async function syncToMailchimp(
  email: string,
  getSettingsFn: () => Promise<MailchimpConfig>,
  fetchFn: typeof fetch,
  firstName?: string,
  lastName?: string,
  structure?: string,
): Promise<{ synced: boolean; error?: string }> {
  try {
    const settings = await getSettingsFn()

    if (!settings.mailchimpEnabled) {
      return { synced: false }
    }

    if (!settings.mailchimpApiKey || !settings.mailchimpServer || !settings.mailchimpListId) {
      return { synced: false, error: 'Configuration Mailchimp incomplete' }
    }

    const baseUrl = `https://${settings.mailchimpServer}.api.mailchimp.com/3.0`
    const authHeader = `Basic ${Buffer.from(`anystring:${settings.mailchimpApiKey}`).toString('base64')}`
    const subscriberHash = md5Hash(email.toLowerCase())

    const mergeFields: Record<string, string> = {}
    if (firstName) mergeFields.FNAME = firstName
    if (lastName) mergeFields.LNAME = lastName
    if (structure) mergeFields.STRUCTURE = structure

    const res = await fetchFn(
      `${baseUrl}/lists/${settings.mailchimpListId}/members/${subscriberHash}`,
      {
        method: 'PUT',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: 'subscribed',
          merge_fields: Object.keys(mergeFields).length > 0 ? mergeFields : undefined,
        }),
      },
    )

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { detail?: string }
      return { synced: false, error: err.detail ?? `Erreur ${res.status}` }
    }

    return { synced: true }
  } catch {
    return { synced: false, error: 'Impossible de contacter Mailchimp' }
  }
}

describe('syncToMailchimp', () => {
  const validSettings: MailchimpConfig = {
    mailchimpEnabled: true,
    mailchimpApiKey: 'test-api-key',
    mailchimpServer: 'us1',
    mailchimpListId: 'list-123',
  }

  let mockFetch: ReturnType<typeof vi.fn>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGetSettings: any

  beforeEach(() => {
    mockFetch = vi.fn()
    mockGetSettings = vi.fn()
  })

  it('returns synced:false when Mailchimp is disabled', async () => {
    mockGetSettings.mockResolvedValue({ mailchimpEnabled: false })
    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result).toEqual({ synced: false })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns error when Mailchimp config is incomplete (no API key)', async () => {
    mockGetSettings.mockResolvedValue({
      mailchimpEnabled: true,
      mailchimpServer: 'us1',
      mailchimpListId: 'list-123',
    })
    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Configuration Mailchimp incomplete')
  })

  it('returns error when Mailchimp config is incomplete (no server)', async () => {
    mockGetSettings.mockResolvedValue({
      mailchimpEnabled: true,
      mailchimpApiKey: 'key',
      mailchimpListId: 'list-123',
    })
    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Configuration Mailchimp incomplete')
  })

  it('sends PUT request with correct URL and auth', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({ ok: true })

    await syncToMailchimp('Test@Example.com', mockGetSettings, mockFetch as any)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]
    const expectedHash = md5Hash('test@example.com')
    expect(url).toBe(`https://us1.api.mailchimp.com/3.0/lists/list-123/members/${expectedHash}`)
    expect(options.method).toBe('PUT')
    expect(options.headers.Authorization).toContain('Basic')
    expect(options.headers['Content-Type']).toBe('application/json')
  })

  it('includes merge fields when provided', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({ ok: true })

    await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any, 'Alice', 'Dupont', 'Centre Social')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.merge_fields).toEqual({
      FNAME: 'Alice',
      LNAME: 'Dupont',
      STRUCTURE: 'Centre Social',
    })
  })

  it('omits merge_fields when no optional params', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({ ok: true })

    await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.merge_fields).toBeUndefined()
  })

  it('returns synced:true on success', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({ ok: true })

    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result).toEqual({ synced: true })
  })

  it('returns error detail from Mailchimp error response', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ detail: 'Invalid email' }),
    })

    const result = await syncToMailchimp('bad@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Invalid email')
  })

  it('falls back to status code error when json parse fails', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('json fail')),
    })

    const result = await syncToMailchimp('bad@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Erreur 500')
  })

  it('catches network errors and returns friendly message', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Impossible de contacter Mailchimp')
  })

  it('catches getSettings errors and returns friendly message', async () => {
    mockGetSettings.mockRejectedValue(new Error('DB down'))

    const result = await syncToMailchimp('test@example.com', mockGetSettings, mockFetch as any)
    expect(result.synced).toBe(false)
    expect(result.error).toBe('Impossible de contacter Mailchimp')
  })

  it('lowercases email for subscriber hash', async () => {
    mockGetSettings.mockResolvedValue(validSettings)
    mockFetch.mockResolvedValue({ ok: true })

    await syncToMailchimp('USER@EXAMPLE.COM', mockGetSettings, mockFetch as any)

    const url = mockFetch.mock.calls[0][0] as string
    const expectedHash = md5Hash('user@example.com')
    expect(url).toContain(expectedHash)
  })
})

describe('md5Hash', () => {
  it('produces a 32-character hex string', () => {
    const hash = md5Hash('test')
    expect(hash).toMatch(/^[a-f0-9]{32}$/)
  })

  it('produces consistent results', () => {
    expect(md5Hash('hello')).toBe(md5Hash('hello'))
  })

  it('produces different results for different inputs', () => {
    expect(md5Hash('hello')).not.toBe(md5Hash('world'))
  })
})
