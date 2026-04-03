<script setup lang="ts">
/**
 * PrConfirmDialog — global singleton dialog driven by the useConfirm() composable.
 *
 * Mount this component once in your root layout. Then use:
 *   const { confirm } = useConfirm()
 *   const ok = await confirm({ description: 'Delete this item?' })
 */
import { useConfirm, useConfirmState } from '../../composables/useConfirm'

const state = useConfirmState()
const { handleConfirm, handleCancel } = useConfirm()

const variantMap: Record<string, 'default' | 'destructive'> = {
  danger: 'destructive',
  warning: 'default',
  default: 'default',
}
</script>

<template>
  <PrDialog
    :open="state.visible"
    :title="state.title"
    :description="state.description"
    :confirm-label="state.confirmLabel"
    :cancel-label="state.cancelLabel"
    :variant="variantMap[state.variant] ?? 'default'"
    @update:open="!$event && handleCancel()"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
