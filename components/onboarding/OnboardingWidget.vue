<script setup lang="ts">
const { showWidget, completedCount, totalSteps, progress, openPanel } = useOnboarding()

const radius = 18
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() =>
  circumference - (progress.value / 100) * circumference,
)
</script>

<template>
  <Teleport to="body">
    <button
      v-if="showWidget"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-prado-teal text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
      :class="{ 'animate-pulse-subtle': completedCount < totalSteps }"
      title="Démarrage rapide"
      @click="openPanel"
    >
      <!-- SVG Progress Ring -->
      <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
        <!-- Background circle -->
        <circle
          cx="22" cy="22" :r="radius"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="opacity-20"
        />
        <!-- Progress circle -->
        <circle
          cx="22" cy="22" :r="radius"
          fill="none"
          stroke="#93C1AF"
          stroke-width="2.5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <!-- Counter -->
      <span class="text-xs font-semibold relative z-10">
        {{ completedCount }}/{{ totalSteps }}
      </span>
    </button>
  </Teleport>
</template>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 70, 87, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 70, 87, 0); }
}
.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}
</style>
