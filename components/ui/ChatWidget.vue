<script setup lang="ts">
import { MessageCircle, X, Loader2, Send, Check } from 'lucide-vue-next'

const isOpen = ref(false)
const form = ref({ name: '', email: '', message: '' })
const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    success.value = false
    errorMsg.value = ''
  }
}

async function handleSubmit() {
  if (!form.value.name || !form.value.email || !form.value.message) return
  submitting.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form.value,
    })
    success.value = true
    form.value = { name: '', email: '', message: '' }
  } catch (err: any) {
    errorMsg.value = err.data?.message ?? 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg bg-prado-bg border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors'
</script>

<template>
  <!-- Floating button -->
  <button
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-prado-sage text-white shadow-lg shadow-prado-sage/30 hover:shadow-xl hover:shadow-prado-sage/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
    :class="isOpen ? 'rotate-90' : ''"
    @click="toggle"
  >
    <X v-if="isOpen" :size="22" />
    <MessageCircle v-else :size="22" />
  </button>

  <!-- Chat panel -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-prado-border shadow-2xl overflow-hidden"
      style="background-color: var(--prado-surface);"
    >
      <!-- Header -->
      <div class="bg-prado-sage px-5 py-4">
        <h3 class="text-white font-medium">Besoin d'aide ?</h3>
        <p class="text-white/70 text-sm">Notre équipe répond sous 48h.</p>
      </div>

      <!-- Content -->
      <div class="p-5">
        <!-- Success -->
        <div v-if="success" class="text-center py-6">
          <div class="w-12 h-12 rounded-full bg-[var(--prado-signature)]/20 flex items-center justify-center mx-auto mb-3">
            <Check :size="22" class="text-[var(--prado-signature-accent)]" />
          </div>
          <p class="text-prado-text font-medium mb-1">Message envoyé !</p>
          <p class="text-sm text-prado-text-muted">Nous vous répondrons dans les plus brefs délais.</p>
          <button
            class="mt-4 text-sm text-[var(--prado-signature-accent)] hover:underline"
            @click="success = false"
          >
            Envoyer un autre message
          </button>
        </div>

        <!-- Form -->
        <form v-else class="space-y-3" @submit.prevent="handleSubmit">
          <div>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Votre nom"
              :class="inputClass"
            />
          </div>
          <div>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="votre@email.fr"
              :class="inputClass"
            />
          </div>
          <div>
            <textarea
              v-model="form.message"
              required
              rows="3"
              placeholder="Votre message..."
              :class="inputClass + ' resize-none'"
            />
          </div>

          <p v-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</p>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-2.5 rounded-lg bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:bg-[var(--prado-signature)]/80 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Loader2 v-if="submitting" :size="14" class="animate-spin" />
            <Send v-else :size="14" />
            Envoyer
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-prado-border text-xs text-prado-text-faint text-center">
        itineraires@le-prado.fr · 04 72 XX XX XX
      </div>
    </div>
  </Transition>
</template>
