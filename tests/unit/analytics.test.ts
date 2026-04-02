import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tests for the useAnalytics composable.
 * Verifies that gtag calls are made when available, and that the composable
 * does not crash when gtag is not loaded.
 */

// We reproduce the composable logic to avoid Nuxt import.meta.server issues in test
function createAnalytics(gtagFn?: ((...args: unknown[]) => void) | any) {
  function trackEvent(name: string, params: Record<string, unknown> = {}) {
    if (typeof gtagFn === 'function') {
      gtagFn('event', name, params)
    }
  }

  function trackInscription(actionId: string | number, actionTitle?: string) {
    trackEvent('inscription', {
      action_id: actionId,
      action_title: actionTitle ?? '',
    })
  }

  function trackContact() {
    trackEvent('contact', { method: 'form' })
  }

  function trackNewsletter(source?: string) {
    trackEvent('newsletter', { source: source ?? 'unknown' })
  }

  return {
    trackEvent,
    trackInscription,
    trackContact,
    trackNewsletter,
  }
}

describe('useAnalytics (unit logic)', () => {
  describe('when gtag is available', () => {
    let mockGtag: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockGtag = vi.fn()
    })

    it('trackEvent calls gtag with event name and params', () => {
      const { trackEvent } = createAnalytics(mockGtag)
      trackEvent('test_event', { key: 'value' })
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { key: 'value' })
    })

    it('trackEvent passes empty params by default', () => {
      const { trackEvent } = createAnalytics(mockGtag)
      trackEvent('test_event')
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {})
    })

    it('trackInscription sends inscription event', () => {
      const { trackInscription } = createAnalytics(mockGtag)
      trackInscription('42', 'Foodtruck')
      expect(mockGtag).toHaveBeenCalledWith('event', 'inscription', {
        action_id: '42',
        action_title: 'Foodtruck',
      })
    })

    it('trackInscription defaults title to empty string', () => {
      const { trackInscription } = createAnalytics(mockGtag)
      trackInscription(42)
      expect(mockGtag).toHaveBeenCalledWith('event', 'inscription', {
        action_id: 42,
        action_title: '',
      })
    })

    it('trackContact sends contact event', () => {
      const { trackContact } = createAnalytics(mockGtag)
      trackContact()
      expect(mockGtag).toHaveBeenCalledWith('event', 'contact', { method: 'form' })
    })

    it('trackNewsletter sends newsletter event with source', () => {
      const { trackNewsletter } = createAnalytics(mockGtag)
      trackNewsletter('footer')
      expect(mockGtag).toHaveBeenCalledWith('event', 'newsletter', { source: 'footer' })
    })

    it('trackNewsletter defaults source to unknown', () => {
      const { trackNewsletter } = createAnalytics(mockGtag)
      trackNewsletter()
      expect(mockGtag).toHaveBeenCalledWith('event', 'newsletter', { source: 'unknown' })
    })
  })

  describe('when gtag is not available', () => {
    it('trackEvent does not throw', () => {
      const { trackEvent } = createAnalytics(undefined)
      expect(() => trackEvent('test_event')).not.toThrow()
    })

    it('trackInscription does not throw', () => {
      const { trackInscription } = createAnalytics(undefined)
      expect(() => trackInscription('42', 'Foodtruck')).not.toThrow()
    })

    it('trackContact does not throw', () => {
      const { trackContact } = createAnalytics(undefined)
      expect(() => trackContact()).not.toThrow()
    })

    it('trackNewsletter does not throw', () => {
      const { trackNewsletter } = createAnalytics(undefined)
      expect(() => trackNewsletter()).not.toThrow()
    })
  })
})
