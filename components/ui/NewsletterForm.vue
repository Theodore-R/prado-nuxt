<script setup lang="ts">
import { Loader2, Send, Check } from 'lucide-vue-next'

defineProps<{
  showStructure?: boolean
  source?: string
}>()

const email = ref('')
const structure = ref('')
const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')

async function handleSubmit(source?: string) {
  if (!email.value) return
  submitting.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/newsletter', {
      method: 'POST',
      body: {
        email: email.value,
        structure: structure.value || undefined,
        source: source ?? 'website',
      },
    })
    success.value = true
    email.value = ''
    structure.value = ''
  } catch (err: any) {
    errorMsg.value = err.data?.message ?? 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <!-- Success state -->
  <div v-if="success" class="flex items-center gap-2 text-[var(--prado-signature-accent)]">
    <Check :size="18" />
    <span class="text-sm">Inscription confirmée !</span>
  </div>

  <!-- Form -->
  <form v-else class="space-y-3" @submit.prevent="handleSubmit(source)">
    <div class="flex gap-2">
      <input
        v-model="email"
        type="email"
        required
        placeholder="votre@email.fr"
        class="flex-1 px-4 py-2.5 rounded-xl bg-prado-surface border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
      />
      <button
        type="submit"
        :disabled="submitting || !email"
        class="px-5 py-2.5 rounded-xl bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:bg-[var(--prado-signature)]/80 hover:shadow-lg hover:shadow-[var(--prado-signature)]/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
      >
        <Loader2 v-if="submitting" :size="14" class="animate-spin" />
        <Send v-else :size="14" />
      </button>
    </div>

    <!-- Optional structure field -->
    <input
      v-if="showStructure"
      v-model="structure"
      type="text"
      placeholder="Votre structure (optionnel)"
      class="w-full px-4 py-2.5 rounded-xl bg-prado-surface border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
    />

    <p v-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</p>
  </form>
</template>
