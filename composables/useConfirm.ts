const _state = reactive({
  visible: false,
  message: '',
  variant: 'danger' as 'danger' | 'warning' | 'default',
  resolve: null as ((value: boolean) => void) | null,
})

export function useConfirmState() {
  return _state
}

export function useConfirm() {
  function confirm(message: string, opts?: { variant?: 'danger' | 'warning' | 'default' }): Promise<boolean> {
    return new Promise((resolve) => {
      _state.message = message
      _state.variant = opts?.variant ?? 'default'
      _state.resolve = resolve
      _state.visible = true
    })
  }

  return { confirm }
}
