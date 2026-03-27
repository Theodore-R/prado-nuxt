<script setup lang="ts">
const model = defineModel<string>({ required: true })
const props = defineProps<{
  placeholder?: string
}>()

const inputRef = ref<HTMLInputElement>()

function formatPhone(value: string): string {
  // Strip everything except digits and leading +
  const hasPlus = value.startsWith('+')
  const digits = value.replace(/\D/g, '')

  if (hasPlus && digits.startsWith('33')) {
    // International +33 format
    const local = digits.slice(2)
    const parts = local.match(/.{1,2}/g) ?? []
    return '+33 ' + parts.join(' ')
  }

  // Standard French format: 06 12 34 56 78
  const parts = digits.match(/.{1,2}/g) ?? []
  return parts.join(' ')
}

function handleInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value
  const formatted = formatPhone(raw)
  model.value = formatted

  // Maintain cursor position
  nextTick(() => {
    if (inputRef.value) inputRef.value.value = formatted
  })
}

const isValid = computed(() => {
  if (!model.value) return true // empty is ok
  const digits = model.value.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('33'))
})

const inputClass = 'w-full px-3 py-2 rounded-lg bg-prado-input-bg border text-prado-text text-sm focus:outline-none transition-colors'
</script>

<template>
  <div class="relative">
    <input
      ref="inputRef"
      :value="model"
      type="tel"
      :class="[inputClass, isValid ? 'border-prado-border focus:border-prado-border-medium' : 'border-red-400 focus:border-red-500']"
      :placeholder="placeholder ?? '06 12 34 56 78'"
      maxlength="17"
      @input="handleInput"
    />
    <span
      v-if="model && !isValid"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-400"
    >
      Format invalide
    </span>
  </div>
</template>
