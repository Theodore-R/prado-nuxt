<script setup lang="ts">
import { Loader2, Save, Users, Infinity, Copy, Archive, ArchiveRestore } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'
import type { DbActionWithPlaces } from '~/lib/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const actions = ref<DbActionWithPlaces[]>([])
const loading = ref(true)
const saving = ref<number | null>(null)
const duplicating = ref<number | null>(null)
const showArchived = ref(false)
const archiving = ref<number | null>(null)

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Action', sortable: true },
  { key: 'is_activite', label: 'Type', sortable: true },
  { key: 'inscriptionsCount', label: 'Inscrits', sortable: true },
  { key: 'places_max', label: 'Places max' },
]

async function loadActions() {
  loading.value = true
  try {
    actions.value = await $fetch<DbActionWithPlaces[]>('/api/admin/actions', {
      query: { archived: showArchived.value ? 'true' : 'false' },
    })
  } catch {
    toast.error('Erreur chargement actions')
  } finally {
    loading.value = false
  }
}

onMounted(loadActions)

watch(showArchived, loadActions)

async function savePlaces(action: Record<string, any>) {
  saving.value = action.id
  try {
    await $fetch('/api/admin/actions', {
      method: 'PATCH',
      body: { id: action.id, places_max: action.places_max },
    })
    toast.success(`Places mises a jour pour "${action.title}"`)
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    saving.value = null
  }
}

function setUnlimited(action: Record<string, any>) {
  actions.value = actions.value.map(a =>
    a.id === action.id ? { ...a, places_max: null } : a
  )
  savePlaces({ ...action, places_max: null })
}

function updatePlacesMax(action: Record<string, any>, value: string) {
  actions.value = actions.value.map(a =>
    a.id === action.id ? { ...a, places_max: value ? Number(value) : null } : a
  )
}

async function toggleArchive(action: Record<string, any>) {
  archiving.value = action.id
  const isArchived = !!action.archived_at
  try {
    await $fetch('/api/admin/actions', {
      method: 'PATCH',
      body: { id: action.id, archived_at: isArchived ? null : new Date().toISOString() },
    })
    actions.value = actions.value.filter(a => a.id !== action.id)
    toast.success(isArchived ? `"${action.title}" desarchivee` : `"${action.title}" archivee`)
  } catch {
    toast.error('Erreur lors de l\'archivage')
  } finally {
    archiving.value = null
  }
}

async function duplicateAction(action: Record<string, any>) {
  duplicating.value = action.id
  try {
    const cloned = await $fetch<DbActionWithPlaces>('/api/admin/actions', {
      method: 'POST',
      body: { sourceId: action.id },
    })
    actions.value = [{ ...cloned, inscriptionsCount: 0, placesRemaining: cloned.places_max }, ...actions.value]
    toast.success(`Action "${action.title}" dupliquee`)
  } catch {
    toast.error('Erreur lors de la duplication')
  } finally {
    duplicating.value = null
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-prado-text italic">Gestion des actions</h1>
      <label class="flex items-center gap-2 text-sm text-prado-text-muted cursor-pointer select-none">
        <input
          v-model="showArchived"
          type="checkbox"
          class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
        />
        <Archive :size="14" />
        Voir les archives
      </label>
    </div>

    <AdminTable
      :columns="columns"
      :rows="actions"
      :loading="loading"
      search-placeholder="Rechercher une action..."
      empty-message="Aucune action"
    >
      <template #cell-title="{ row }">
        <div class="flex items-center gap-2">
          <span class="text-prado-text">{{ row.title }}</span>
          <span v-if="row.archived_at" class="px-1.5 py-0.5 rounded text-[10px] bg-prado-tag-bg text-prado-text-faint">Archive</span>
        </div>
        <div class="text-xs text-prado-text-faint">{{ row.category }}</div>
      </template>
      <template #cell-is_activite="{ value }">
        <span
          class="px-2 py-0.5 rounded-full text-xs"
          :class="value ? 'bg-[#CF006C]/15 text-[#CF006C]' : 'bg-prado-tag-bg text-prado-text-muted'"
        >
          {{ value ? 'Planifie' : 'Sur mesure' }}
        </span>
      </template>
      <template #cell-inscriptionsCount="{ row }">
        <div class="flex items-center gap-1.5 text-prado-text">
          <Users :size="14" class="text-prado-text-faint" />
          {{ row.inscriptionsCount }}
        </div>
      </template>
      <template #cell-places_max="{ row }">
        <input
          :value="row.places_max ?? ''"
          type="number"
          min="0"
          :placeholder="'∞'"
          class="w-full px-3 py-1.5 rounded-lg bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium"
          @input="updatePlacesMax(row, ($event.target as HTMLInputElement).value)"
        />
      </template>
      <template #actions="{ row }">
        <button
          class="p-1.5 rounded-lg hover:bg-[#93C1AF]/20 text-[#93C1AF] transition-colors"
          title="Sauvegarder"
          :disabled="saving === row.id"
          @click="savePlaces(row)"
        >
          <Loader2 v-if="saving === row.id" :size="16" class="animate-spin" />
          <Save v-else :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-faint transition-colors"
          title="Illimite"
          @click="setUnlimited(row)"
        >
          <Infinity :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg hover:bg-prado-teal/15 text-prado-teal dark:text-prado-text-muted transition-colors"
          title="Dupliquer cette action"
          :disabled="duplicating === row.id"
          @click="duplicateAction(row)"
        >
          <Loader2 v-if="duplicating === row.id" :size="16" class="animate-spin" />
          <Copy v-else :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg transition-colors"
          :class="row.archived_at ? 'hover:bg-[#93C1AF]/20 text-[#93C1AF]' : 'hover:bg-orange-500/10 text-orange-400'"
          :title="row.archived_at ? 'Desarchiver' : 'Archiver'"
          :disabled="archiving === row.id"
          @click="toggleArchive(row)"
        >
          <Loader2 v-if="archiving === row.id" :size="16" class="animate-spin" />
          <ArchiveRestore v-else-if="row.archived_at" :size="16" />
          <Archive v-else :size="16" />
        </button>
      </template>
    </AdminTable>
  </div>
</template>
