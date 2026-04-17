<script setup lang="ts">
import { Shield, Download, Loader2, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { user, logout } = useAuth()
const supabaseUser = useSupabaseUser()
const { confirm } = usePradoConfirm()

const deleting = ref(false)
const exporting = ref(false)
const showDeleteConfirm = ref(false)
const deleteEmailInput = ref('')

const statusLabel = computed(() => {
  switch (user.value?.status) {
    case 'approved': return 'Approuve'
    case 'pending': return 'En attente'
    case 'rejected': return 'Refuse'
    default: return '-'
  }
})

const statusColor = computed(() => {
  switch (user.value?.status) {
    case 'approved': return 'text-green-500 bg-green-500/10'
    case 'pending': return 'text-amber-500 bg-amber-500/10'
    case 'rejected': return 'text-red-400 bg-red-500/10'
    default: return 'text-prado-text-muted bg-prado-tag-bg'
  }
})

async function handleExport() {
  exporting.value = true
  try {
    const data = await $fetch('/api/export-data')
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mes-donnees-prado.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Donnees exportees')
  } catch {
    toast.error('Erreur lors de l\'export')
  }
  exporting.value = false
}

async function handleDelete() {
  const confirmed = await confirm(
    'Etes-vous sur de vouloir supprimer votre compte ? Cette action est irreversible. Toutes vos donnees (jeunes, inscriptions) seront definitivement supprimees.',
    { variant: 'danger' },
  )
  if (!confirmed) return

  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (deleteEmailInput.value !== user.value?.email) {
    toast.error('L\'email ne correspond pas')
    return
  }
  deleting.value = true
  try {
    await $fetch('/api/delete-account', {
      method: 'POST',
      body: { confirmEmail: deleteEmailInput.value },
    })
    toast.success('Compte supprime')
    await logout()
    navigateTo('/')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
  deleting.value = false
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium'
</script>

<template>
  <div class="space-y-6">
    <!-- Account info -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
      <h2 class="text-sm font-semibold text-prado-text flex items-center gap-2 mb-4">
        <Shield :size="16" /> Compte
      </h2>
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-sm text-prado-text-muted w-40">Statut</span>
          <span :class="['text-sm px-3 py-1 rounded-full', statusColor]">
            {{ statusLabel }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-prado-text-muted w-40">Membre depuis</span>
          <span class="text-sm text-prado-text">
            {{ supabaseUser?.created_at
              ? new Date(supabaseUser.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              : '-'
            }}
          </span>
        </div>
      </div>

      <div class="mt-5">
        <button
          :disabled="exporting"
          class="flex items-center gap-2 px-4 py-2 rounded-full border border-prado-border text-sm text-prado-text hover:bg-prado-surface-hover transition-colors disabled:opacity-50"
          @click="handleExport"
        >
          <Loader2 v-if="exporting" :size="14" class="animate-spin" />
          <Download v-else :size="14" />
          Telecharger mes donnees
        </button>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="bg-prado-surface rounded-2xl border border-red-500/30 p-6">
      <h2 class="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
        <Trash2 :size="16" /> Zone de danger
      </h2>
      <p class="text-xs text-prado-text-muted mb-4">
        La suppression de votre compte est definitive. Toutes vos donnees (profil, jeunes, inscriptions) seront supprimees.
      </p>

      <div v-if="!showDeleteConfirm">
        <button
          class="px-4 py-2 rounded-full border border-red-500/40 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          @click="handleDelete"
        >
          Supprimer mon compte
        </button>
      </div>

      <div v-else class="space-y-3">
        <p class="text-sm text-prado-text">
          Pour confirmer, saisissez votre adresse email :
          <strong class="text-prado-text">{{ user?.email }}</strong>
        </p>
        <input
          v-model="deleteEmailInput"
          type="email"
          :placeholder="user?.email"
          :class="inputClass"
        />
        <div class="flex gap-3">
          <button
            :disabled="deleting"
            class="px-5 py-2 rounded-full bg-red-600 text-white text-sm disabled:opacity-50 flex items-center gap-2"
            @click="confirmDelete"
          >
            <Loader2 v-if="deleting" :size="14" class="animate-spin" />
            Confirmer la suppression
          </button>
          <button
            class="px-4 py-2 rounded-full border border-prado-border text-sm text-prado-text-muted hover:bg-prado-surface-hover transition-colors"
            @click="showDeleteConfirm = false; deleteEmailInput = ''"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
