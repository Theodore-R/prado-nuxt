/**
 * Generic toast composable.
 * Wraps vue-sonner when available, falls back to console for environments
 * where vue-sonner is not installed.
 */

export interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

/** Try to dynamically resolve vue-sonner toast. Returns null if unavailable. */
function resolveSonnerToast(): ToastApi | null {
  try {
    // Dynamic require/import attempt — vue-sonner must be installed by the consumer
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sonner = (globalThis as Record<string, unknown>).__vueSonnerToast as ToastApi | undefined
    if (sonner && typeof sonner.success === 'function') {
      return sonner
    }
  } catch {
    // Not available
  }
  return null
}

/** Fallback toast that outputs to console. */
function createFallbackToast(): ToastApi {
  return {
    success: (message: string) => {
      if (typeof console !== 'undefined') {
        // Using console.info for toast fallback is intentional (not production logging)
        // eslint-disable-next-line no-console
        console.info(`[toast:success] ${message}`)
      }
    },
    error: (message: string) => {
      if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error(`[toast:error] ${message}`)
      }
    },
    info: (message: string) => {
      if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.info(`[toast:info] ${message}`)
      }
    },
    warning: (message: string) => {
      if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(`[toast:warning] ${message}`)
      }
    },
  }
}

let _toastOverride: ToastApi | null = null

/**
 * Allow consumers to inject their own toast implementation (e.g., vue-sonner).
 *
 * Usage in app setup:
 * ```ts
 * import { toast } from 'vue-sonner'
 * import { setToastProvider } from '@prado/ui/composables'
 * setToastProvider(toast)
 * ```
 */
export function setToastProvider(provider: ToastApi): void {
  _toastOverride = provider
}

/**
 * Returns a toast API. Uses the injected provider, then vue-sonner if available,
 * then falls back to console output.
 */
export function useToast(): ToastApi {
  if (_toastOverride) return _toastOverride

  const sonner = resolveSonnerToast()
  if (sonner) return sonner

  return createFallbackToast()
}
