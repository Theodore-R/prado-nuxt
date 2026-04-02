import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UseClipboardReturn {
  /** Copy text to clipboard. Returns true on success. */
  copy: (text: string) => Promise<boolean>
  /** True for 2 seconds after a successful copy */
  copied: Ref<boolean>
  /** Whether the Clipboard API is supported */
  isSupported: ComputedRef<boolean>
}

/**
 * Clipboard composable with copy feedback.
 *
 * Usage:
 * ```ts
 * const { copy, copied, isSupported } = useClipboard()
 * await copy('hello')
 * // copied.value is true for 2 seconds
 * ```
 */
export function useClipboard(): UseClipboardReturn {
  const copied = ref(false)
  let resetTimeout: ReturnType<typeof setTimeout> | null = null

  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false
    return typeof navigator !== 'undefined' && !!navigator.clipboard
  })

  async function copy(text: string): Promise<boolean> {
    if (!isSupported.value) return false

    // Clear previous timeout
    if (resetTimeout !== null) {
      clearTimeout(resetTimeout)
      resetTimeout = null
    }

    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      resetTimeout = setTimeout(() => {
        copied.value = false
        resetTimeout = null
      }, 2000)
      return true
    } catch {
      copied.value = false
      return false
    }
  }

  return { copy, copied, isSupported }
}
