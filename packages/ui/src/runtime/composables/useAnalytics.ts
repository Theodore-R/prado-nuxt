/**
 * Generic analytics composable.
 * Sends events to Google Analytics (gtag) when available.
 * No-op on the server or when gtag is not loaded.
 *
 * Usage:
 * ```ts
 * const { trackEvent, trackPageView, trackClick } = useAnalytics()
 * trackEvent('signup', { method: 'email' })
 * trackPageView()
 * trackClick('hero-cta')
 * ```
 */

export interface UseAnalyticsReturn {
  /** Track a named event with optional parameters */
  trackEvent: (name: string, params?: Record<string, unknown>) => void
  /** Track the current page view */
  trackPageView: (path?: string) => void
  /** Track a click with a label */
  trackClick: (label: string) => void
}

type GtagFn = (...args: unknown[]) => void

function getGtag(): GtagFn | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') return w.gtag
  return null
}

export function useAnalytics(): UseAnalyticsReturn {
  function trackEvent(name: string, params: Record<string, unknown> = {}): void {
    const gtag = getGtag()
    if (!gtag) return
    gtag('event', name, params)
  }

  function trackPageView(path?: string): void {
    const gtag = getGtag()
    if (!gtag) return
    const pagePath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/')
    gtag('event', 'page_view', { page_path: pagePath })
  }

  function trackClick(label: string): void {
    trackEvent('click', { event_label: label })
  }

  return { trackEvent, trackPageView, trackClick }
}
