<script setup lang="ts">
import { RefreshCw, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { get, save, saving } = useAdminSettings()

interface NewsletterSettings {
  mailchimpEnabled: boolean
  mailchimpApiKey: string
  mailchimpListId: string
  mailchimpServer: string
  lastSyncAt: string | null
  syncCount: number
}

const form = reactive<NewsletterSettings>({
  mailchimpEnabled: false,
  mailchimpApiKey: '',
  mailchimpListId: '',
  mailchimpServer: '',
  lastSyncAt: null,
  syncCount: 0,
})

const testing = ref(false)
const testResult = ref<{ ok: boolean; listName?: string; memberCount?: number; error?: string } | null>(null)
const syncing = ref(false)

watchEffect(() => {
  const s = get<NewsletterSettings>('newsletter')
  form.mailchimpEnabled = s.mailchimpEnabled ?? false
  form.mailchimpApiKey = s.mailchimpApiKey ?? ''
  form.mailchimpListId = s.mailchimpListId ?? ''
  form.mailchimpServer = s.mailchimpServer ?? ''
  form.lastSyncAt = s.lastSyncAt ?? null
  form.syncCount = s.syncCount ?? 0
})

async function handleSave() {
  await save('newsletter', {
    mailchimpEnabled: form.mailchimpEnabled,
    mailchimpApiKey: form.mailchimpApiKey,
    mailchimpListId: form.mailchimpListId,
    mailchimpServer: form.mailchimpServer,
  })
}

async function testConnection() {
  testing.value = true
  testResult.value = null
  try {
    const res = await $fetch<{ ok: boolean; listName?: string; memberCount?: number; error?: string }>('/api/admin/settings/test-mailchimp', { method: 'POST' })
    testResult.value = res
  } catch {
    testResult.value = { ok: false, error: 'Impossible de contacter l\'API Mailchimp' }
  } finally {
    testing.value = false
  }
}

async function syncNow() {
  syncing.value = true
  try {
    const res = await $fetch<{ synced: number }>('/api/admin/settings/sync-newsletter', { method: 'POST' })
    toast.success(`${res.synced} abonné(s) synchronisé(s)`)
  } catch {
    toast.error('Erreur lors de la synchronisation')
  } finally {
    syncing.value = false
  }
}

function formatDate(iso: string | null) {
  if (!iso) return 'Jamais'
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-prado-sage/50 transition-colors'
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg font-semibold text-prado-text mb-1">Newsletter & Mailchimp</h2>
      <p class="text-sm text-prado-text-muted">Connectez votre compte Mailchimp pour synchroniser les abonnés.</p>
    </div>

    <!-- Toggle -->
    <div class="flex items-center justify-between py-2">
      <div>
        <p class="text-sm text-prado-text font-medium">Synchroniser avec Mailchimp</p>
        <p class="text-xs text-prado-text-faint mt-0.5">Les nouveaux abonnés seront ajoutés automatiquement à votre liste Mailchimp</p>
      </div>
      <button
        type="button"
        :class="[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
          form.mailchimpEnabled ? 'bg-prado-sage' : 'bg-prado-border',
        ]"
        role="switch"
        :aria-checked="form.mailchimpEnabled"
        @click="form.mailchimpEnabled = !form.mailchimpEnabled"
      >
        <span
          :class="[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
            form.mailchimpEnabled ? 'translate-x-5' : 'translate-x-0',
          ]"
        />
      </button>
    </div>

    <!-- Mailchimp config (shown when enabled) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="form.mailchimpEnabled" class="space-y-4">
        <div>
          <label class="block text-sm text-prado-text-muted mb-1.5">Clé API</label>
          <input v-model="form.mailchimpApiKey" type="password" :class="inputClass" placeholder="xxxxxxxx-us21" />
          <p class="text-[10px] text-prado-text-faint mt-1">
            Mailchimp → Account → Extras →
            <a href="https://us1.admin.mailchimp.com/account/api/" target="_blank" rel="noopener" class="text-prado-sage hover:underline">
              API Keys <ExternalLink :size="10" class="inline" />
            </a>
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-prado-text-muted mb-1.5">ID de l'audience</label>
            <input v-model="form.mailchimpListId" :class="inputClass" placeholder="abc1234def" />
          </div>
          <div>
            <label class="block text-sm text-prado-text-muted mb-1.5">Préfixe serveur</label>
            <input v-model="form.mailchimpServer" :class="inputClass" placeholder="us21" />
            <p class="text-[10px] text-prado-text-faint mt-1">La partie avant .api.mailchimp.com dans votre URL</p>
          </div>
        </div>

        <!-- Test result -->
        <div v-if="testResult" :class="['p-3 rounded-xl text-sm border', testResult.ok ? 'bg-[#93C1AF]/10 border-[#93C1AF]/30 text-[#93C1AF]' : 'bg-red-500/10 border-red-500/30 text-red-400']">
          <div class="flex items-center gap-2">
            <CheckCircle v-if="testResult.ok" :size="16" />
            <XCircle v-else :size="16" />
            <span v-if="testResult.ok">Connecté — {{ testResult.listName }} ({{ testResult.memberCount }} contacts)</span>
            <span v-else>{{ testResult.error }}</span>
          </div>
        </div>

        <!-- Sync info -->
        <div v-if="form.lastSyncAt" class="text-xs text-prado-text-faint">
          Dernière sync : {{ formatDate(form.lastSyncAt) }} — {{ form.syncCount }} abonné(s)
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-3">
          <button
            :disabled="testing || !form.mailchimpApiKey || !form.mailchimpListId"
            class="px-4 py-2 rounded-xl border border-prado-border text-prado-text-secondary text-sm hover:bg-prado-surface-hover transition-colors disabled:opacity-50"
            @click="testConnection"
          >
            <Loader2 v-if="testing" :size="14" class="animate-spin inline mr-1.5" />
            Tester la connexion
          </button>
          <button
            :disabled="syncing || !form.mailchimpApiKey || !form.mailchimpListId"
            class="px-4 py-2 rounded-xl border border-prado-border text-prado-text-secondary text-sm hover:bg-prado-surface-hover transition-colors disabled:opacity-50"
            @click="syncNow"
          >
            <Loader2 v-if="syncing" :size="14" class="animate-spin inline mr-1.5" />
            <RefreshCw v-else :size="14" class="inline mr-1.5" />
            Synchroniser maintenant
          </button>
        </div>
      </div>
    </Transition>

    <!-- Save -->
    <div class="pt-2">
      <button
        :disabled="saving"
        class="px-5 py-2.5 rounded-xl bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        @click="handleSave"
      >
        <Loader2 v-if="saving" :size="14" class="animate-spin inline mr-1.5" />
        Enregistrer
      </button>
    </div>
  </div>
</template>
