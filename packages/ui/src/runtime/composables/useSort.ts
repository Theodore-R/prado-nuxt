import { ref, computed, type Ref, type ComputedRef } from 'vue'

export type SortDirection = 'asc' | 'desc'

export interface UseSortOptions {
  defaultKey?: string
  defaultDirection?: SortDirection
}

export interface UseSortReturn {
  sortKey: Ref<string | null>
  sortDirection: Ref<SortDirection>
  /** Toggle sort for a key. If same key, flips direction. If different key, starts ascending. */
  toggle: (key: string) => void
  /** Reset sort to initial state */
  reset: () => void
  /** Comparator function suitable for Array.prototype.sort */
  comparator: ComputedRef<(a: Record<string, unknown>, b: Record<string, unknown>) => number>
}

/**
 * Sorting state composable for table columns or lists.
 *
 * Usage:
 * ```ts
 * const { sortKey, sortDirection, toggle, comparator } = useSort({ defaultKey: 'name' })
 * const sorted = computed(() => [...items].sort(comparator.value))
 * ```
 */
export function useSort(options: UseSortOptions = {}): UseSortReturn {
  const sortKey = ref<string | null>(options.defaultKey ?? null)
  const sortDirection = ref<SortDirection>(options.defaultDirection ?? 'asc')

  function toggle(key: string): void {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  function reset(): void {
    sortKey.value = options.defaultKey ?? null
    sortDirection.value = options.defaultDirection ?? 'asc'
  }

  const comparator = computed(() => {
    const key = sortKey.value
    const dir = sortDirection.value

    return (a: Record<string, unknown>, b: Record<string, unknown>): number => {
      if (!key) return 0

      const valA = a[key]
      const valB = b[key]

      // Handle null/undefined
      if (valA == null && valB == null) return 0
      if (valA == null) return dir === 'asc' ? -1 : 1
      if (valB == null) return dir === 'asc' ? 1 : -1

      // String comparison
      if (typeof valA === 'string' && typeof valB === 'string') {
        const result = valA.localeCompare(valB, undefined, { sensitivity: 'base' })
        return dir === 'asc' ? result : -result
      }

      // Numeric comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir === 'asc' ? valA - valB : valB - valA
      }

      // Fallback: coerce to string
      const strA = String(valA)
      const strB = String(valB)
      const result = strA.localeCompare(strB)
      return dir === 'asc' ? result : -result
    }
  })

  return { sortKey, sortDirection, toggle, reset, comparator }
}
