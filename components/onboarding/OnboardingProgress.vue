<script setup lang="ts">
defineProps<{
  current: number
  total: number
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="flex-1 h-1.5 rounded-full bg-prado-surface overflow-hidden">
      <div
        class="h-full rounded-full bg-prado-sage transition-all duration-500 ease-out"
        :style="{ width: `${(current / total) * 100}%` }"
      />
    </div>
    <span class="text-xs text-prado-text-muted shrink-0">{{ current }}/{{ total }}</span>
  </div>
</template>
