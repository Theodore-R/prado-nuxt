<script setup lang="ts">
import { Loader2, Save, Users, Infinity } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'
import type { DbActionWithPlaces } from '~/lib/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const actions = ref<DbActionWithPlaces[]>([])
const loading = ref(true)
const saving = ref<number | null>(null)

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Action', sortable: true },
  { key: 'is_activite', label: 'Type', sortable: true },
  { key: 'inscriptionsCount', label: 'Inscrits', sortable: true },
  { key: 'places_max', label: 'Places max' },
]

onMounted(async () => {
  try {
    actions.value = await $fetch<DbActionWithPlaces[]>('/api/actions')
  } catch {
    toast.error('Erreur chargement actions')
  } finally {
    loading.value = false
  }
})

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
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <h1 class="text-xl font-semibold text-prado-text italic">Gestion des places par action</h1>

    <AdminTable
      :columns="columns"
      :rows="actions"
      :loading="loading"
      search-placeholder="Rechercher une action..."
      empty-message="Aucune action"
    >
      <template #cell-title="{ row }">
        <div class="text-prado-text">{{ row.title }}</div>
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
      </template>
    </AdminTable>
  </div>
</template>
