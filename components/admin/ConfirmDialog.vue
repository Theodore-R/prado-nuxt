<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

const state = useConfirmState()

const variantClasses = {
  danger: 'bg-red-500 hover:bg-red-600',
  warning: 'bg-[#FB6223] hover:bg-[#FB6223]/90',
  default: 'bg-prado-teal hover:bg-prado-teal/90',
}

function handleConfirm() {
  state.resolve?.(true)
  state.visible = false
}

function handleCancel() {
  state.resolve?.(false)
  state.visible = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="state.visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleCancel" />
        <div class="relative rounded-2xl border border-prado-border p-6 max-w-md w-full shadow-xl" style="background-color: var(--prado-surface)">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 flex-shrink-0">
              <AlertTriangle :size="20" class="text-red-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-prado-text mb-1">Confirmation</h3>
              <p class="text-sm text-prado-text-secondary">{{ state.message }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 rounded-xl text-sm text-prado-text-secondary border border-prado-border hover:bg-prado-surface-hover transition-colors"
              @click="handleCancel"
            >
              Annuler
            </button>
            <button
              :class="['px-4 py-2 rounded-xl text-sm text-white transition-colors', variantClasses[state.variant]]"
              @click="handleConfirm"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
