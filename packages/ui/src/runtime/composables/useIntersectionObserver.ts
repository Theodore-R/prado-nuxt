import { ref, watch, onUnmounted, type Ref } from 'vue'

export interface UseIntersectionObserverReturn {
  /** Whether the target element is currently intersecting the viewport */
  isIntersecting: Ref<boolean>
  /** Stop observing (also called automatically onUnmounted) */
  stop: () => void
}

/**
 * Reactive IntersectionObserver composable, SSR-safe.
 *
 * Usage:
 * ```ts
 * const target = ref<HTMLElement>()
 * const { isIntersecting } = useIntersectionObserver(target, (entry) => {
 *   // optional callback for each intersection change
 * })
 * ```
 */
export function useIntersectionObserver(
  target: Ref<Element | null | undefined>,
  callback?: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
): UseIntersectionObserverReturn {
  const isIntersecting = ref(false)
  let observer: IntersectionObserver | null = null

  function cleanup() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function observe(el: Element | null | undefined) {
    cleanup()
    if (!el) return
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      isIntersecting.value = entry.isIntersecting
      if (callback) {
        callback(entry)
      }
    }, options)

    observer.observe(el)
  }

  // Watch for target element changes (e.g., v-if toggling)
  watch(
    () => target.value,
    (el) => {
      observe(el)
    },
    { immediate: true, flush: 'post' },
  )

  function stop() {
    cleanup()
  }

  onUnmounted(() => {
    cleanup()
  })

  return { isIntersecting, stop }
}
