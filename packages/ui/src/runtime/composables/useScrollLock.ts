import { ref, onUnmounted, type Ref } from 'vue'

export interface UseScrollLockReturn {
  /** Lock body scroll (prevents scrolling for modals) */
  lock: () => void
  /** Unlock body scroll */
  unlock: () => void
  /** Whether scroll is currently locked */
  isLocked: Ref<boolean>
}

/**
 * Body scroll lock composable for modals and overlays.
 * Preserves scroll position and restores it on unlock.
 * Cleans up on unmount.
 *
 * Usage:
 * ```ts
 * const { lock, unlock, isLocked } = useScrollLock()
 * lock()   // prevents body scrolling
 * unlock() // restores scrolling
 * ```
 */
export function useScrollLock(): UseScrollLockReturn {
  const isLocked = ref(false)
  let savedOverflow = ''
  let savedPaddingRight = ''

  function getScrollbarWidth(): number {
    if (typeof document === 'undefined') return 0
    return window.innerWidth - document.documentElement.clientWidth
  }

  function lock(): void {
    if (typeof document === 'undefined') return
    if (isLocked.value) return

    const scrollbarWidth = getScrollbarWidth()
    savedOverflow = document.body.style.overflow
    savedPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    // Prevent layout shift from scrollbar disappearing
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    isLocked.value = true
  }

  function unlock(): void {
    if (typeof document === 'undefined') return
    if (!isLocked.value) return

    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight

    isLocked.value = false
  }

  onUnmounted(() => {
    if (isLocked.value) {
      unlock()
    }
  })

  return { lock, unlock, isLocked }
}
