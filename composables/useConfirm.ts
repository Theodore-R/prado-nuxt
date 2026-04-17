/**
 * App-level usePradoConfirm — delegates to @prado/ui's useConfirm with backwards-compatible API.
 *
 * Supports both:
 *   confirm('Are you sure?', { variant: 'danger' })   // legacy string + opts
 *   confirm({ description: 'Are you sure?', variant: 'danger' })  // new API
 */
import {
  useConfirm as _useConfirm,
  type ConfirmOptions,
} from '@theodoreriant/prado-ui/composables'

export function usePradoConfirm() {
  const { confirm: libConfirm, handleConfirm, handleCancel } = _useConfirm()

  function confirm(
    messageOrOptions: string | ConfirmOptions,
    opts?: { variant?: 'danger' | 'warning' | 'default' },
  ): Promise<boolean> {
    if (typeof messageOrOptions === 'string') {
      return libConfirm({
        description: messageOrOptions,
        variant: opts?.variant ?? 'default',
      })
    }
    return libConfirm(messageOrOptions)
  }

  return { confirm, handleConfirm, handleCancel }
}
