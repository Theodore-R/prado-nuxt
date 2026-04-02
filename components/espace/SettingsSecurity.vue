<script setup lang="ts">
import { Loader2, Key } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { updatePassword } = useAuth()

const showForm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)

async function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  if (newPassword.value.length < 6) {
    toast.error('Le mot de passe doit contenir au moins 6 caracteres')
    return
  }
  saving.value = true
  const result = await updatePassword(newPassword.value)
  saving.value = false
  if (result.error) {
    toast.error(result.error)
    return
  }
  toast.success('Mot de passe modifie')
  showForm.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-prado-text flex items-center gap-2">
        <Key :size="16" /> Securite
      </h2>
      <button
        class="text-sm text-prado-teal hover:underline"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Annuler' : 'Changer le mot de passe' }}
      </button>
    </div>

    <form
      v-if="showForm"
      class="grid grid-cols-1 sm:grid-cols-2 gap-3"
      @submit.prevent="handleSubmit"
    >
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Nouveau mot de passe</label>
        <input v-model="newPassword" type="password" required :class="inputClass" placeholder="6 caracteres minimum" />
      </div>
      <div>
        <label class="text-xs text-prado-text-muted mb-1 block">Confirmer</label>
        <input v-model="confirmPassword" type="password" required :class="inputClass" />
      </div>
      <div class="sm:col-span-2">
        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2 rounded-full bg-[#FB6223] text-white text-sm disabled:opacity-50 flex items-center gap-2"
        >
          <Loader2 v-if="saving" :size="14" class="animate-spin" />
          Modifier le mot de passe
        </button>
      </div>
    </form>
  </div>
</template>
