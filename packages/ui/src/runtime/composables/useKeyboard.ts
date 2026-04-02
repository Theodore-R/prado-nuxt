import { onMounted, onUnmounted } from 'vue'

/**
 * Parse a shortcut string like 'ctrl+k' or 'meta+shift+p' into a matcher object.
 */
function parseShortcut(shortcut: string): {
  key: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
} {
  const parts = shortcut.toLowerCase().split('+').map((s) => s.trim())
  return {
    key: parts[parts.length - 1],
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  }
}

/**
 * Check whether a KeyboardEvent matches a parsed shortcut.
 */
function matchesShortcut(
  event: KeyboardEvent,
  parsed: ReturnType<typeof parseShortcut>,
): boolean {
  const eventKey = event.key.toLowerCase()

  if (eventKey !== parsed.key) return false
  if (parsed.ctrl && !event.ctrlKey) return false
  if (parsed.meta && !event.metaKey) return false
  if (parsed.shift && !event.shiftKey) return false
  if (parsed.alt && !event.altKey) return false

  return true
}

/**
 * Keyboard shortcuts composable. Registers shortcuts on mount, cleans up on unmount.
 *
 * Usage:
 * ```ts
 * useKeyboard({
 *   'ctrl+k': () => openSearch(),
 *   'escape': () => close(),
 *   'meta+shift+p': () => openCommandPalette(),
 * })
 * ```
 */
export function useKeyboard(shortcuts: Record<string, () => void>): void {
  const parsed = Object.entries(shortcuts).map(([shortcut, handler]) => ({
    ...parseShortcut(shortcut),
    handler,
  }))

  function handleKeydown(event: KeyboardEvent) {
    for (const entry of parsed) {
      if (matchesShortcut(event, entry)) {
        event.preventDefault()
        entry.handler()
        return
      }
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleKeydown)
    }
  })
}
