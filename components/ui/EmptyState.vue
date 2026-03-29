<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

interface Props {
  icon?: typeof Inbox
  title: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
    <div class="w-14 h-14 rounded-2xl bg-prado-surface-hover flex items-center justify-center mb-4">
      <component :is="icon ?? Inbox" :size="24" class="text-prado-text-faint" />
    </div>
    <p class="text-sm font-medium text-prado-text mb-1">{{ title }}</p>
    <p v-if="description" class="text-xs text-prado-text-muted max-w-xs mb-4">{{ description }}</p>
    <NuxtLink
      v-if="ctaLabel && ctaTo"
      :to="ctaTo"
      class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[#1a1a2e] text-sm font-medium hover:brightness-110 transition-all"
    >
      {{ ctaLabel }}
    </NuxtLink>
  </div>
</template>
