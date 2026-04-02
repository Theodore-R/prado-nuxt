<script setup lang="ts">
import { Send, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { get, save, saving } = useAdminSettings()

interface EmailSettings {
  senderName: string
  senderEmail: string
  replyToEmail: string
  reminderJ1Enabled: boolean
  reminderJ2Enabled: boolean
}

const form = reactive<EmailSettings>({
  senderName: '',
  senderEmail: '',
  replyToEmail: '',
  reminderJ1Enabled: true,
  reminderJ2Enabled: true,
})

const sendingTest = ref(false)

watchEffect(() => {
  const s = get<EmailSettings>('email')
  form.senderName = s.senderName ?? 'Prado Itinéraires'
  form.senderEmail = s.senderEmail ?? 'noreply@prado-itineraires.fr'
  form.replyToEmail = s.replyToEmail ?? ''
  form.reminderJ1Enabled = s.reminderJ1Enabled ?? true
  form.reminderJ2Enabled = s.reminderJ2Enabled ?? true
})

async function handleSave() {
  await save('email', { ...form })
}

async function sendTestEmail() {
  sendingTest.value = true
  try {
    await $fetch('/api/admin/settings/test-email', { method: 'POST' })
    toast.success('Email de test envoyé !')
  } catch {
    toast.error('Échec de l\'envoi de l\'email de test')
  } finally {
    sendingTest.value = false
  }
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors'
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-prado-text mb-1">Email & Notifications</h2>
      <p class="text-sm text-prado-text-muted">Configurez l'expéditeur des emails et les rappels automatiques.</p>
    </div>

    <!-- Sender -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium text-prado-text-secondary uppercase tracking-wider">Expéditeur</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-prado-text-muted mb-1.5">Nom de l'expéditeur</label>
          <input v-model="form.senderName" :class="inputClass" placeholder="Prado Itinéraires" />
        </div>
        <div>
          <label class="block text-sm text-prado-text-muted mb-1.5">Adresse d'envoi</label>
          <input v-model="form.senderEmail" type="email" :class="inputClass" placeholder="noreply@prado-itineraires.fr" />
        </div>
      </div>
      <div>
        <label class="block text-sm text-prado-text-muted mb-1.5">Adresse de réponse (optionnel)</label>
        <input v-model="form.replyToEmail" type="email" :class="inputClass" placeholder="contact@prado-itineraires.fr" />
      </div>
    </div>

    <!-- Reminders -->
    <div class="space-y-4">
      <h3 class="text-sm font-medium text-prado-text-secondary uppercase tracking-wider">Rappels automatiques</h3>
      <p class="text-xs text-prado-text-faint">Les rappels sont envoyés chaque matin aux prescripteurs pour les actions à venir.</p>

      <div class="space-y-3">
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="text-sm text-prado-text">Envoyer un rappel la veille (J-1)</p>
          </div>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
              form.reminderJ1Enabled ? 'bg-prado-sage' : 'bg-prado-border',
            ]"
            role="switch"
            :aria-checked="form.reminderJ1Enabled"
            @click="form.reminderJ1Enabled = !form.reminderJ1Enabled"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                form.reminderJ1Enabled ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <p class="text-sm text-prado-text">Envoyer un rappel 2 jours avant (J-2)</p>
          </div>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
              form.reminderJ2Enabled ? 'bg-prado-sage' : 'bg-prado-border',
            ]"
            role="switch"
            :aria-checked="form.reminderJ2Enabled"
            @click="form.reminderJ2Enabled = !form.reminderJ2Enabled"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                form.reminderJ2Enabled ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3 pt-2">
      <button
        :disabled="saving"
        class="px-5 py-2.5 rounded-xl bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        @click="handleSave"
      >
        <Loader2 v-if="saving" :size="14" class="animate-spin inline mr-1.5" />
        Enregistrer
      </button>
      <button
        :disabled="sendingTest"
        class="px-5 py-2.5 rounded-xl border border-prado-border text-prado-text-secondary text-sm hover:bg-prado-surface-hover transition-colors disabled:opacity-50"
        @click="sendTestEmail"
      >
        <Loader2 v-if="sendingTest" :size="14" class="animate-spin inline mr-1.5" />
        <Send v-else :size="14" class="inline mr-1.5" />
        Envoyer un email de test
      </button>
    </div>
  </div>
</template>
