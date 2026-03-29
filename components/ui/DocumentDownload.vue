<script setup lang="ts">
import { FileText, Download } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
  category?: string
  fileUrl: string
  fileSize?: string
}>()
</script>

<template>
  <a
    :href="fileUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-start gap-4 p-5 rounded-2xl bg-prado-surface border border-prado-border hover:border-prado-border-medium hover:-translate-y-0.5 transition-all"
  >
    <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
      <FileText :size="22" class="text-red-500" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-prado-text font-medium mb-1 group-hover:text-[var(--prado-signature-accent)] transition-colors">{{ title }}</h3>
      <p v-if="description" class="text-sm text-prado-text-muted line-clamp-2 mb-2">{{ description }}</p>
      <div class="flex items-center gap-3 text-xs text-prado-text-faint">
        <span v-if="category" class="px-2 py-0.5 rounded-full bg-prado-tag-bg">{{ category }}</span>
        <span v-if="fileSize">{{ fileSize }}</span>
        <span>PDF</span>
      </div>
    </div>
    <Download :size="18" class="text-prado-text-faint group-hover:text-[var(--prado-signature-accent)] transition-colors shrink-0 mt-1" />
  </a>
</template>
