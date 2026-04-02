import { watch, onUnmounted, type Ref } from 'vue'

/**
 * Detect clicks outside a target element and invoke a callback.
 * Cleans up automatically on unmount.
 *
 * Usage:
 * ```ts
 * const dropdownRef = ref<HTMLElement>()
 * useClickOutside(dropdownRef, () => { isOpen.value = false })
 * ```
 */
export function useClickOutside(
  target: Ref<Element | null | undefined>,
  callback: () => void,
): void {
  let handler: ((event: PointerEvent) => void) | null = null

  function setup() {
    cleanup()
    if (typeof document === 'undefined') return

    handler = (event: PointerEvent) => {
      const el = target.value
      if (!el) return
      // Check if click target is outside the element
      if (!el.contains(event.target as Node)) {
        callback()
      }
    }

    // Use pointerdown instead of click for better UX (fires before mouseup)
    document.addEventListener('pointerdown', handler)
  }

  function cleanup() {
    if (handler && typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', handler)
      handler = null
    }
  }

  // Setup when target becomes available
  watch(
    () => target.value,
    (el) => {
      if (el) {
        setup()
      } else {
        cleanup()
      }
    },
    { immediate: true, flush: 'post' },
  )

  onUnmounted(() => {
    cleanup()
  })
}
