/**
 * Composable for tracking analytics events via Google Analytics 4.
 * Only fires events if gtag is loaded (GA4 ID configured + cookies accepted).
 */
export function usePradoAnalytics() {
  function trackEvent(name: string, params: Record<string, unknown> = {}) {
    if (import.meta.server) return
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, params)
    }
  }

  /** Track an inscription event */
  function trackInscription(actionId: string | number, actionTitle?: string) {
    trackEvent('inscription', {
      action_id: actionId,
      action_title: actionTitle ?? '',
    })
  }

  /** Track a contact form submission */
  function trackContact() {
    trackEvent('contact', { method: 'form' })
  }

  /** Track a newsletter subscription */
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
