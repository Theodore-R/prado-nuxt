import { ref, type Ref } from 'vue'

export interface UseFilterOptions {
  /** Object keys to search within */
  keys: string[]
}

export interface UseFilterReturn {
  /** Current search query (reactive) */
  query: Ref<string>
  /** Filter an array of objects. Returns items where at least one key contains the query. */
  filter: <T extends Record<string, unknown>>(items: T[]) => T[]
}

/**
 * Text filter composable for searching within object arrays.
 *
 * Usage:
 * ```ts
 * const { query, filter } = useFilter({ keys: ['name', 'email'] })
 * const results = computed(() => filter(users.value))
 * ```
 */
export function useFilter(options: UseFilterOptions): UseFilterReturn {
  const { keys } = options
  const query = ref('')

  function filter<T extends Record<string, unknown>>(items: T[]): T[] {
    const trimmed = query.value.trim().toLowerCase()
    if (!trimmed) return items

    return items.filter((item) =>
      keys.some((key) => {
        const value = item[key]
        if (value == null) return false
        return String(value).toLowerCase().includes(trimmed)
      }),
    )
  }

  return { query, filter }
}
