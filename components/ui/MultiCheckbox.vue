<script setup lang="ts">
const props = defineProps<{
  options: readonly { value: string; label: string }[]
}>()

const selected = defineModel<string[]>({ required: true })

function toggle(value: string) {
  if (selected.value.includes(value)) {
    selected.value = selected.value.filter(v => v !== value)
  } else {
    selected.value = [...selected.value, value]
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors"
      :class="selected.includes(opt.value)
        ? 'bg-[#004657]/10 border-[#004657]/30 text-[#004657]'
        : 'bg-prado-input-bg border-prado-border text-prado-text-muted hover:border-prado-border-medium'"
      @click="toggle(opt.value)"
    >
      <span
        class="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors"
        :class="selected.includes(opt.value)
          ? 'bg-[#004657] border-[#004657]'
          : 'border-prado-border'"
      >
        <svg v-if="selected.includes(opt.value)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {{ opt.label }}
    </button>
  </div>
</template>
