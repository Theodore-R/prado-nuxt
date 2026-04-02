import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UseThemeReturn {
  /** Current mode setting (light / dark / system) */
  mode: Ref<ThemeMode>
  /** Resolved theme after applying system preference */
  resolved: Ref<'light' | 'dark'>
  /** Set the theme mode */
  setMode: (m: ThemeMode) => void
  /** Cycle through light -> dark -> system */
  toggle: () => void
}

const STORAGE_KEY = 'pr-theme'

/**
 * Generic theme composable. Toggles light/dark/system, persists to localStorage,
 * and sets `data-theme` on `<html>`.
 */
export function useTheme(): UseThemeReturn {
  const mode = ref<ThemeMode>('system')
  const resolved = ref<'light' | 'dark'>('light')

  let mediaQuery: MediaQueryList | null = null
  let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null

  function getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function resolve(m: ThemeMode): 'light' | 'dark' {
    if (m === 'system') return getSystemPreference()
    return m
  }

  function applyTheme(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
  }

  function persist(m: ThemeMode) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, m)
    } catch {
      // Storage may be unavailable (private mode, quota exceeded)
    }
  }

  function loadFromStorage(): ThemeMode {
    if (typeof window === 'undefined') return 'system'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    } catch {
      // Ignore storage read errors
    }
    return 'system'
  }

  function setMode(m: ThemeMode) {
    mode.value = m
    resolved.value = resolve(m)
    applyTheme(resolved.value)
    persist(m)
  }

  function toggle() {
    const cycle: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = cycle.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % cycle.length
    setMode(cycle[nextIndex])
  }

  function setupMediaListener() {
    if (typeof window === 'undefined') return
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaHandler = () => {
      if (mode.value === 'system') {
        resolved.value = getSystemPreference()
        applyTheme(resolved.value)
      }
    }
    mediaQuery.addEventListener('change', mediaHandler)
  }

  function cleanupMediaListener() {
    if (mediaQuery && mediaHandler) {
      mediaQuery.removeEventListener('change', mediaHandler)
      mediaQuery = null
      mediaHandler = null
    }
  }

  // Initialize
  onMounted(() => {
    const stored = loadFromStorage()
    mode.value = stored
    resolved.value = resolve(stored)
    applyTheme(resolved.value)
    setupMediaListener()
  })

  onUnmounted(() => {
    cleanupMediaListener()
  })

  return { mode, resolved, setMode, toggle }
}
