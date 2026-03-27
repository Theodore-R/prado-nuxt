<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Min date de naissance = aujourd'hui (bébé né aujourd'hui)
// Max date de naissance = aujourd'hui - 18 ans + 1 jour (doit avoir < 18 ans)
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const minDate = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <input
    type="date"
    :value="modelValue"
    :max="maxDate"
    :min="minDate"
    required
    :class="inputClass"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
