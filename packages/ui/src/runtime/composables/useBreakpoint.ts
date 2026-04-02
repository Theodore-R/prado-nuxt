import { ref, onMounted, onUnmounted, type Ref, type ComputedRef, computed } from 'vue'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

export interface UseBreakpointReturn {
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
  breakpoint: Ref<Breakpoint>
}

/** Tailwind default breakpoints in pixels */
const BREAKPOINTS = {
  sm: 0,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

/**
 * Reactive breakpoint composable based on Tailwind breakpoints.
 * Uses matchMedia for efficient, SSR-safe detection.
 *
 * - sm: < 768px (mobile)
 * - md: 768px - 1023px (tablet)
 * - lg: 1024px - 1279px (desktop)
 * - xl: >= 1280px (large desktop)
 */
export function useBreakpoint(): UseBreakpointReturn {
  const breakpoint = ref<Breakpoint>('lg')

  const isMobile = computed(() => breakpoint.value === 'sm')
  const isTablet = computed(() => breakpoint.value === 'md')
  const isDesktop = computed(() => breakpoint.value === 'lg' || breakpoint.value === 'xl')

  const queries: Array<{ mql: MediaQueryList; handler: (e: MediaQueryListEvent) => void }> = []

  function detectBreakpoint(): Breakpoint {
    if (typeof window === 'undefined') return 'lg'
    const width = window.innerWidth
    if (width >= BREAKPOINTS.xl) return 'xl'
    if (width >= BREAKPOINTS.lg) return 'lg'
    if (width >= BREAKPOINTS.md) return 'md'
    return 'sm'
  }

  function setupListeners() {
    if (typeof window === 'undefined') return

    // Use matchMedia for each breakpoint threshold
    const thresholds = [
      { query: `(min-width: ${BREAKPOINTS.xl}px)`, bp: 'xl' as Breakpoint },
      { query: `(min-width: ${BREAKPOINTS.lg}px)`, bp: 'lg' as Breakpoint },
      { query: `(min-width: ${BREAKPOINTS.md}px)`, bp: 'md' as Breakpoint },
    ]

    for (const threshold of thresholds) {
      const mql = window.matchMedia(threshold.query)
      const handler = () => {
        breakpoint.value = detectBreakpoint()
      }
      mql.addEventListener('change', handler)
      queries.push({ mql, handler })
    }
  }

  function cleanupListeners() {
    for (const { mql, handler } of queries) {
      mql.removeEventListener('change', handler)
    }
    queries.length = 0
  }

  onMounted(() => {
    breakpoint.value = detectBreakpoint()
    setupListeners()
  })

  onUnmounted(() => {
    cleanupListeners()
  })

  return { isMobile, isTablet, isDesktop, breakpoint }
}
