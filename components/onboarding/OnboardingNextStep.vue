<script setup lang="ts">
import { ArrowRight, Rocket } from 'lucide-vue-next'

const { nextStep, showWidget, openPanel, completedCount, totalSteps } = useOnboarding()
</script>

<template>
  <div
    v-if="showWidget && nextStep"
    class="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#004657]/8 border border-[#004657]/15 mb-6 group cursor-pointer hover:bg-[#004657]/12 transition-colors"
    @click="openPanel"
  >
    <div class="w-8 h-8 rounded-lg bg-[#004657]/15 flex items-center justify-center shrink-0">
      <Rocket :size="16" class="text-[#004657]" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-prado-text-muted">Prochaine étape ({{ completedCount }}/{{ totalSteps }})</p>
      <p class="text-sm text-prado-text font-medium truncate">{{ nextStep.label }}</p>
    </div>
    <ArrowRight
      :size="16"
      class="text-prado-text-muted group-hover:text-prado-text group-hover:translate-x-0.5 transition-all shrink-0"
    />
  </div>
</template>
