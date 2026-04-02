import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UsePaginationOptions {
  total: Ref<number> | number
  pageSize?: number
}

export interface UsePaginationReturn {
  page: Ref<number>
  pageSize: Ref<number>
  totalPages: ComputedRef<number>
  /** 1-based index of the first item on the current page */
  from: ComputedRef<number>
  /** 1-based index of the last item on the current page */
  to: ComputedRef<number>
  isFirst: ComputedRef<boolean>
  isLast: ComputedRef<boolean>
  next: () => void
  prev: () => void
  goTo: (n: number) => void
}

/**
 * Pagination state composable.
 *
 * Usage:
 * ```ts
 * const total = ref(100)
 * const { page, totalPages, next, prev, from, to } = usePagination({ total })
 * ```
 */
export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const totalRef = typeof options.total === 'number' ? ref(options.total) : options.total
  const page = ref(1)
  const pageSize = ref(options.pageSize ?? 10)

  const totalPages = computed(() => {
    if (totalRef.value <= 0) return 1
    return Math.ceil(totalRef.value / pageSize.value)
  })

  const from = computed(() => {
    if (totalRef.value === 0) return 0
    return (page.value - 1) * pageSize.value + 1
  })

  const to = computed(() => {
    if (totalRef.value === 0) return 0
    return Math.min(page.value * pageSize.value, totalRef.value)
  })

  const isFirst = computed(() => page.value <= 1)
  const isLast = computed(() => page.value >= totalPages.value)

  function next() {
    if (!isLast.value) {
      page.value = page.value + 1
    }
  }

  function prev() {
    if (!isFirst.value) {
      page.value = page.value - 1
    }
  }

  function goTo(n: number) {
    const clamped = Math.max(1, Math.min(n, totalPages.value))
    page.value = clamped
  }

  return {
    page,
    pageSize,
    totalPages,
    from,
    to,
    isFirst,
    isLast,
    next,
    prev,
    goTo,
  }
}
