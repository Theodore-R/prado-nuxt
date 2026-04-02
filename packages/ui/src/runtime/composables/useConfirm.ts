import { reactive, type DeepReadonly } from 'vue'

export type ConfirmVariant = 'danger' | 'warning' | 'default'

export interface ConfirmOptions {
  title?: string
  description?: string
  variant?: ConfirmVariant
  confirmLabel?: string
  cancelLabel?: string
}

export interface ConfirmState {
  visible: boolean
  title: string
  description: string
  variant: ConfirmVariant
  confirmLabel: string
  cancelLabel: string
  resolve: ((value: boolean) => void) | null
}

/** Module-level singleton state for the confirm dialog. */
const _state = reactive<ConfirmState>({
  visible: false,
  title: 'Confirmation',
  description: '',
  variant: 'default',
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  resolve: null,
})

/**
 * Access the internal confirm state (used by PrDialog or a confirm dialog component).
 */
export function useConfirmState(): ConfirmState {
  return _state
}

/**
 * Promise-based confirmation dialog composable.
 *
 * Usage:
 * ```ts
 * const { confirm } = useConfirm()
 * const ok = await confirm({ title: 'Delete?', variant: 'danger' })
 * if (ok) { ... }
 * ```
 *
 * Integrate with PrDialog by using `useConfirmState()` in your dialog wrapper.
 */
export function useConfirm() {
  function confirm(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      _state.title = options.title ?? 'Confirmation'
      _state.description = options.description ?? ''
      _state.variant = options.variant ?? 'default'
      _state.confirmLabel = options.confirmLabel ?? 'Confirmer'
      _state.cancelLabel = options.cancelLabel ?? 'Annuler'
      _state.resolve = resolve
      _state.visible = true
    })
  }

  /** Call from the dialog component when user confirms. */
  function handleConfirm() {
    if (_state.resolve) {
      _state.resolve(true)
    }
    _state.visible = false
    _state.resolve = null
  }

  /** Call from the dialog component when user cancels. */
  function handleCancel() {
    if (_state.resolve) {
      _state.resolve(false)
    }
    _state.visible = false
    _state.resolve = null
  }

  return { confirm, handleConfirm, handleCancel }
}
