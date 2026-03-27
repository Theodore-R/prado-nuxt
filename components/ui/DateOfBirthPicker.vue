<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Max date = today (mineurs acceptés)
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <input
    type="date"
    :value="modelValue"
    :max="maxDate"
    min="1940-01-01"
    required
    :class="inputClass"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
