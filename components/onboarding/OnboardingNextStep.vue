<script setup lang="ts">
import { ArrowRight, Rocket } from 'lucide-vue-next'

const { nextStep, showWidget, openPanel, completedCount, totalSteps } = useOnboarding()
</script>

<template>
  <div
    v-if="showWidget && nextStep"
    class="flex items-center gap-3 px-4 py-3 rounded-xl bg-prado-signature-muted border border-prado-signature/20 mb-6 group cursor-pointer hover:border-prado-signature/40 transition-colors"
    @click="openPanel"
  >
    <div class="w-8 h-8 rounded-lg bg-prado-signature/15 flex items-center justify-center shrink-0">
      <Rocket :size="16" class="text-prado-signature" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-prado-text-muted">Prochaine étape ({{ completedCount }}/{{ totalSteps }})</p>
      <p class="text-sm text-prado-text font-medium truncate">{{ nextStep.label }}</p>
    </div>
    <ArrowRight
      :size="16"
      class="text-prado-signature group-hover:translate-x-0.5 transition-all shrink-0"
    />
  </div>
</template>
