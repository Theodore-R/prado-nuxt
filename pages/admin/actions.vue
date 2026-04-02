<script setup lang="ts">
import { Loader2, Save, Users, Infinity, Copy, Archive, ArchiveRestore, Euro, Repeat, Building2, X, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'
import type { DbActionWithPlaces, Etablissement } from '~/lib/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const actions = ref<DbActionWithPlaces[]>([])
const loading = ref(true)
const saving = ref<number | null>(null)
const duplicating = ref<number | null>(null)
const showArchived = ref(false)
const archiving = ref<number | null>(null)

// Etablissements for selector
const etablissements = ref<Etablissement[]>([])
onMounted(async () => {
  try {
    etablissements.value = await $fetch<Etablissement[]>('/api/admin/etablissements')
  } catch { /* silent */ }
})

// Edit modal for cost / recurring / etablissement
const showEditModal = ref(false)
const editAction = ref<Record<string, any> | null>(null)
const editCost = ref<string>('')
const editIsRecurring = ref(false)
const editEtablissementId = ref<string>('')
const editFrequency = ref<'weekly' | 'biweekly' | 'monthly'>('weekly')
const editStartDate = ref('')
const editEndDate = ref('')
const savingEdit = ref(false)

function openEditModal(action: Record<string, any>) {
  editAction.value = action
  editCost.value = action.cost != null ? String(action.cost) : ''
  editIsRecurring.value = action.is_recurring ?? false
  editEtablissementId.value = action.etablissement_id ?? ''
  showEditModal.value = true
}

async function handleSaveEdit() {
  if (!editAction.value) return
  savingEdit.value = true
  try {
    const updates: Record<string, unknown> = {
      id: editAction.value.id,
    }
    const costNum = editCost.value ? Number(editCost.value) : null
    updates.cost = costNum
    updates.is_recurring = editIsRecurring.value
    updates.etablissement_id = editEtablissementId.value || null

    await $fetch('/api/admin/actions', {
      method: 'PATCH',
      body: updates,
    })

    actions.value = actions.value.map(a =>
      a.id === editAction.value!.id
        ? { ...a, cost: costNum, is_recurring: editIsRecurring.value, etablissement_id: editEtablissementId.value || null }
        : a,
    )

    toast.success('Action mise a jour')
    showEditModal.value = false
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    savingEdit.value = false
  }
}

// Create recurring action
const showRecurringModal = ref(false)
const recurringTitle = ref('')
const recurringCategory = ref('')
const recurringTime = ref('')
const recurringPlacesMax = ref<string>('')
const recurringCost = ref<string>('')
const recurringEtablissementId = ref<string>('')
const recurringFrequency = ref<'weekly' | 'biweekly' | 'monthly'>('weekly')
const recurringStartDate = ref('')
const recurringEndDate = ref('')
const creatingRecurring = ref(false)

async function handleCreateRecurring() {
  if (!recurringTitle.value.trim() || !recurringStartDate.value || !recurringEndDate.value) {
    toast.error('Titre, date de debut et date de fin requis')
    return
  }
  creatingRecurring.value = true
  try {
    await $fetch('/api/admin/actions/recurring', {
      method: 'POST',
      body: {
        baseAction: {
          title: recurringTitle.value,
          category: recurringCategory.value,
          time: recurringTime.value,
          places_max: recurringPlacesMax.value ? Number(recurringPlacesMax.value) : null,
          cost: recurringCost.value ? Number(recurringCost.value) : null,
          etablissement_id: recurringEtablissementId.value || null,
          is_activite: true,
          is_published: false,
        },
        frequency: recurringFrequency.value,
        startDate: recurringStartDate.value,
        endDate: recurringEndDate.value,
      },
    })
    toast.success('Action recurrente creee')
    showRecurringModal.value = false
    await loadActions()
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur lors de la creation')
  } finally {
    creatingRecurring.value = false
  }
}

const columns: AdminTableColumn[] = [
  { key: 'title', label: 'Action', sortable: true },
  { key: 'is_activite', label: 'Type', sortable: true },
  { key: 'cost', label: 'Cout', sortable: true, hiddenBelow: 'md' },
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
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Gestion des actions</h1>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:opacity-90 transition-opacity"
          @click="showRecurringModal = true"
        >
          <Repeat :size="14" /> Action recurrente
        </button>
        <label class="flex items-center gap-2 text-sm text-prado-text-muted cursor-pointer select-none">
          <input
            v-model="showArchived"
            type="checkbox"
            class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
          />
          <Archive :size="14" />
          Archives
        </label>
      </div>
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
          :class="value ? 'bg-[#FB6223]/15 text-[#FB6223]' : 'bg-prado-tag-bg text-prado-text-muted'"
        >
          {{ value ? 'Planifie' : 'Sur mesure' }}
        </span>
      </template>
      <template #cell-cost="{ row }">
        <span v-if="row.cost != null" class="text-prado-text">{{ row.cost }} &euro;</span>
        <span v-else class="text-prado-text-faint">-</span>
      </template>
      <template #cell-inscriptionsCount="{ row }">
        <div class="flex items-center gap-1.5 text-prado-text">
          <Users :size="14" class="text-prado-text-faint" />
          {{ row.inscriptionsCount }}
          <Repeat v-if="row.is_recurring" :size="12" class="text-prado-text-faint ml-1" title="Recurrente" />
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
          class="p-1.5 rounded-lg hover:bg-prado-surface-hover text-prado-text-muted transition-colors"
          title="Modifier cout / recurrence / etablissement"
          @click="openEditModal(row)"
        >
          <Euro :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg hover:bg-[#93C1AF]/20 text-[#93C1AF] transition-colors"
          title="Sauvegarder places"
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

    <!-- Edit action modal (cost / recurring / etablissement) -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showEditModal = false">
        <div class="rounded-2xl border border-prado-border p-6 w-full max-w-md mx-4 shadow-xl" style="background-color: var(--prado-surface)">
          <h3 class="text-lg font-semibold text-prado-text mb-4">Modifier l'action</h3>
          <form class="space-y-4" @submit.prevent="handleSaveEdit">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Cout (euros)</label>
              <input
                v-model="editCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
              />
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Etablissement d'accueil</label>
              <select
                v-model="editEtablissementId"
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
              >
                <option value="">Aucun</option>
                <option v-for="e in etablissements" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="editIsRecurring"
                type="checkbox"
                class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
              />
              <span class="text-sm text-prado-text">Action recurrente</span>
            </label>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors"
                @click="showEditModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="savingEdit"
                class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="savingEdit" :size="14" class="animate-spin" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Create recurring action modal -->
    <Teleport to="body">
      <div v-if="showRecurringModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showRecurringModal = false">
        <div class="rounded-2xl border border-prado-border p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto" style="background-color: var(--prado-surface)">
          <h3 class="text-lg font-semibold text-prado-text mb-4">Creer une action recurrente</h3>
          <form class="space-y-4" @submit.prevent="handleCreateRecurring">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Titre *</label>
              <input
                v-model="recurringTitle"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Categorie</label>
                <input
                  v-model="recurringCategory"
                  type="text"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Heure</label>
                <input
                  v-model="recurringTime"
                  type="time"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Frequence *</label>
              <select
                v-model="recurringFrequency"
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
              >
                <option value="weekly">Hebdomadaire</option>
                <option value="biweekly">Bihebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Date debut *</label>
                <input
                  v-model="recurringStartDate"
                  type="date"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Date fin *</label>
                <input
                  v-model="recurringEndDate"
                  type="date"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Places max</label>
                <input
                  v-model="recurringPlacesMax"
                  type="number"
                  min="0"
                  placeholder="Illimite"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Cout (euros)</label>
                <input
                  v-model="recurringCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Etablissement d'accueil</label>
              <select
                v-model="recurringEtablissementId"
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-[var(--prado-signature)]/50 transition-colors"
              >
                <option value="">Aucun</option>
                <option v-for="e in etablissements" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors"
                @click="showRecurringModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="creatingRecurring"
                class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="creatingRecurring" :size="14" class="animate-spin" />
                Creer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
