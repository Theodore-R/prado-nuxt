import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * Reactive media query match composable, SSR-safe.
 * Returns false on the server.
 *
 * Usage:
 * ```ts
 * const isLandscape = useMediaQuery('(orientation: landscape)')
 * const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
 * ```
 */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)

  let mql: MediaQueryList | null = null
  let handler: ((e: MediaQueryListEvent) => void) | null = null

  onMounted(() => {
    if (typeof window === 'undefined') return

    mql = window.matchMedia(query)
    matches.value = mql.matches

    handler = (e: MediaQueryListEvent) => {
      matches.value = e.matches
    }
    mql.addEventListener('change', handler)
  })

  onUnmounted(() => {
    if (mql && handler) {
      mql.removeEventListener('change', handler)
      mql = null
      handler = null
    }
  })

  return matches
}
