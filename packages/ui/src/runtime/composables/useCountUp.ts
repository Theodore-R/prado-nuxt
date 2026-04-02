import { ref, onUnmounted, type Ref } from 'vue'

export interface UseCountUpOptions {
  /** End value to count up to */
  endValue: number
  /** Animation duration in ms (default: 1500) */
  duration?: number
  /** Easing function. Default is easeOutQuart. */
  easing?: (t: number) => number
}

export interface UseCountUpReturn {
  /** Current displayed value (reactive) */
  displayValue: Ref<number>
  /** Start the animation */
  start: () => void
  /** Reset to 0 */
  reset: () => void
}

/** Default easeOutQuart easing */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * Animated count-up composable using requestAnimationFrame.
 * No external dependencies (no GSAP).
 *
 * Usage:
 * ```ts
 * const { displayValue, start } = useCountUp({ endValue: 1234, duration: 2000 })
 * onMounted(() => start())
 * ```
 */
export function useCountUp(options: UseCountUpOptions): UseCountUpReturn {
  const { endValue, duration = 1500, easing = easeOutQuart } = options
  const displayValue = ref(0)
  let animationId: number | null = null

  function cleanup() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function start(): void {
    cleanup()
    if (typeof window === 'undefined') {
      displayValue.value = endValue
      return
    }

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      displayValue.value = Math.round(easedProgress * endValue)

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        displayValue.value = endValue
        animationId = null
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  function reset(): void {
    cleanup()
    displayValue.value = 0
  }

  onUnmounted(() => {
    cleanup()
  })

  return { displayValue, start, reset }
}
