import { ref, watch, type Ref } from 'vue'

/**
 * Reactive localStorage binding, SSR-safe.
 * Returns `defaultValue` on the server. Syncs to localStorage on the client.
 *
 * Usage:
 * ```ts
 * const count = useLocalStorage('my-count', 0)
 * count.value = 5 // persisted to localStorage
 * ```
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(defaultValue) as Ref<T>

  function read(): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  function write(value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded or storage unavailable
    }
  }

  // Initialize from storage on client
  if (typeof window !== 'undefined') {
    data.value = read()
  }

  // Persist changes
  watch(data, (newValue) => {
    write(newValue)
  }, { deep: true })

  return data
}
