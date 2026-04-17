<script setup lang="ts">
import { ArrowRight, Rocket } from 'lucide-vue-next'

const { nextStep, showWidget, openPanel, completedCount, totalSteps } = usePradoOnboarding()
</script>

<template>
  <div
    v-if="showWidget && nextStep"
    class="flex items-center gap-4 px-5 py-4 rounded-2xl bg-prado-sage/15 border-2 border-prado-sage/40 mb-6 group cursor-pointer hover:border-prado-sage/60 hover:bg-prado-sage/20 transition-all"
    @click="openPanel"
  >
    <div class="w-10 h-10 rounded-xl bg-prado-sage flex items-center justify-center shrink-0">
      <Rocket :size="18" class="text-prado-black" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-prado-text-muted font-medium">Prochaine etape ({{ completedCount }}/{{ totalSteps }})</p>
      <p class="text-sm text-prado-text font-semibold truncate">{{ nextStep.label }}</p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <span class="hidden sm:inline text-xs font-medium text-prado-sage">Continuer</span>
      <ArrowRight
        :size="18"
        class="text-prado-sage group-hover:translate-x-1 transition-transform"
      />
    </div>
  </div>
</template>
