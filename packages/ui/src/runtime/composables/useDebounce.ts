import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * Returns a debounced version of a reactive ref.
 * The returned ref updates only after `delay` ms of no changes to the source.
 *
 * Usage:
 * ```ts
 * const search = ref('')
 * const debouncedSearch = useDebounce(search, 300)
 * ```
 */
export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debounced = ref(value.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function cleanup() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  watch(value, (newVal) => {
    cleanup()
    timeoutId = setTimeout(() => {
      debounced.value = newVal
      timeoutId = null
    }, delay)
  })

  onUnmounted(() => {
    cleanup()
  })

  return debounced
}
