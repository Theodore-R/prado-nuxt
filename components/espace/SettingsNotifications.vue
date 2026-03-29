<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const client = useSupabaseClient()
const supabaseUser = useSupabaseUser()

const prefs = ref({
  email_confirmations: true,
  email_reminders: true,
  newsletter: false,
})
const saving = ref(false)

// Load from user_metadata
watch(supabaseUser, (u) => {
  if (u?.user_metadata?.notification_preferences) {
    const saved = u.user_metadata.notification_preferences
    prefs.value = {
      email_confirmations: saved.email_confirmations ?? true,
      email_reminders: saved.email_reminders ?? true,
      newsletter: saved.newsletter ?? false,
    }
  }
}, { immediate: true })

async function save() {
  saving.value = true
  const { error } = await client.auth.updateUser({
    data: { notification_preferences: { ...prefs.value } },
  })
  saving.value = false
  if (error) {
    toast.error('Erreur lors de la sauvegarde')
    return
  }
  toast.success('Preferences mises a jour')
}

const toggles = [
  { key: 'email_confirmations' as const, label: 'Confirmations d\'inscription', desc: 'Recevoir un email lors de l\'inscription d\'un jeune a une action' },
  { key: 'email_reminders' as const, label: 'Rappels', desc: 'Recevoir des rappels avant les dates d\'actions' },
  { key: 'newsletter' as const, label: 'Newsletter', desc: 'Recevoir la newsletter Prado avec les actualites et nouvelles actions' },
]
</script>

<template>
  <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
    <h2 class="text-sm font-semibold text-prado-text flex items-center gap-2 mb-4">
      <Bell :size="16" /> Notifications
    </h2>

    <div class="space-y-4">
      <div
        v-for="toggle in toggles"
        :key="toggle.key"
        class="flex items-center justify-between gap-4"
      >
        <div>
          <p class="text-sm text-prado-text">{{ toggle.label }}</p>
          <p class="text-xs text-prado-text-muted">{{ toggle.desc }}</p>
        </div>
        <button
          type="button"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
            prefs[toggle.key] ? 'bg-prado-teal' : 'bg-prado-border',
          ]"
          role="switch"
          :aria-checked="prefs[toggle.key]"
          @click="prefs[toggle.key] = !prefs[toggle.key]"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
              prefs[toggle.key] ? 'translate-x-5' : 'translate-x-0',
            ]"
          />
        </button>
      </div>
    </div>

    <div class="mt-5">
      <button
        :disabled="saving"
        class="px-5 py-2 rounded-full bg-prado-teal text-white text-sm disabled:opacity-50"
        @click="save"
      >
        Enregistrer les preferences
      </button>
    </div>
  </div>
</template>
