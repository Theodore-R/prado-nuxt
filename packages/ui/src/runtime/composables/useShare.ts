import { computed, type ComputedRef } from 'vue'

export interface UseShareReturn {
  /** Share using native Web Share API, falls back to copyLink */
  share: (title: string, text: string, url: string) => Promise<void>
  /** Whether the native Web Share API is available */
  canNativeShare: ComputedRef<boolean>
  /** Copy a URL to clipboard. Returns true on success. */
  copyLink: (url: string) => Promise<boolean>
  /** Open an email client with pre-filled subject and body */
  shareByEmail: (title: string, url: string) => void
}

/**
 * Generic sharing composable. Uses the Web Share API when available,
 * with clipboard and email fallbacks. No toast dependency -- consumers
 * can wrap copyLink with their own UI feedback.
 *
 * Usage:
 * ```ts
 * const { share, copyLink, shareByEmail, canNativeShare } = useShare()
 * await share('Title', 'Description', 'https://example.com')
 * ```
 */
export function useShare(): UseShareReturn {
  const canNativeShare = computed(() => {
    if (typeof window === 'undefined') return false
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  })

  async function share(title: string, text: string, url: string): Promise<void> {
    if (canNativeShare.value) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or share failed -- fall through to copy
      }
    }
    await copyLink(url)
  }

  async function copyLink(url: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return false
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }

  function shareByEmail(title: string, url: string): void {
    if (typeof window === 'undefined') return
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${title}\n${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return { share, copyLink, shareByEmail, canNativeShare }
}
