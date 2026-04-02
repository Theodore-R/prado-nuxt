import { onUnmounted } from 'vue'

/**
 * Returns a throttled version of the given function.
 * The function will be invoked at most once per `delay` ms.
 * Trailing calls are also executed after the delay.
 *
 * Usage:
 * ```ts
 * const throttledScroll = useThrottle((e: Event) => { ... }, 200)
 * ```
 */
export function useThrottle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let lastCallTime = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function cleanup() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  function throttled(...args: Args): void {
    const now = Date.now()
    const elapsed = now - lastCallTime

    if (elapsed >= delay) {
      cleanup()
      lastCallTime = now
      fn(...args)
    } else if (timeoutId === null) {
      // Schedule a trailing call
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        timeoutId = null
        fn(...args)
      }, delay - elapsed)
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return throttled
}
