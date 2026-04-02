<script setup lang="ts">
import { Download, Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface AdminStructure {
  id: string
  name: string
  is_prado: boolean
  type: string | null
  postal_code: string | null
  city: string | null
  created_at: string
  prescripteurs_count: number
  jeunes_count: number
}

const structures = ref<AdminStructure[]>([])
const loading = ref(true)

const columns: AdminTableColumn[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'city', label: 'Ville', sortable: true, hiddenBelow: 'sm' },
  { key: 'prescripteurs_count', label: 'Prescripteurs', sortable: true, hiddenBelow: 'md' },
  { key: 'jeunes_count', label: 'Jeunes', sortable: true, hiddenBelow: 'md' },
  { key: 'created_at', label: 'Date creation', sortable: true, hiddenBelow: 'lg' },
]

async function loadStructures() {
  try {
    structures.value = await $fetch<AdminStructure[]>('/api/admin/structures')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
}

onMounted(loadStructures)

// ─── Add modal ───
const showAddModal = ref(false)
const newName = ref('')
const newIsPrado = ref(false)
const newType = ref('')
const newPostalCode = ref('')
const newCity = ref('')
const adding = ref(false)

async function handleAdd() {
  const name = newName.value.trim()
  if (!name) return
  adding.value = true
  try {
    await $fetch('/api/admin/structures', {
      method: 'POST',
      body: {
        name,
        is_prado: newIsPrado.value,
        type: newType.value || null,
        postal_code: newPostalCode.value || null,
        city: newCity.value || null,
      },
    })
    toast.success('Structure creee')
    showAddModal.value = false
    newName.value = ''
    newIsPrado.value = false
    newType.value = ''
    newPostalCode.value = ''
    newCity.value = ''
    loading.value = true
    await loadStructures()
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur')
  } finally {
    adding.value = false
  }
}

// ─── Edit modal ───
const showEditModal = ref(false)
const editId = ref('')
const editName = ref('')
const editIsPrado = ref(false)
const editType = ref('')
const editPostalCode = ref('')
const editCity = ref('')
const editing = ref(false)

function openEdit(structure: AdminStructure) {
  editId.value = structure.id
  editName.value = structure.name
  editIsPrado.value = structure.is_prado ?? false
  editType.value = structure.type ?? ''
  editPostalCode.value = structure.postal_code ?? ''
  editCity.value = structure.city ?? ''
  showEditModal.value = true
}

async function handleEdit() {
  const name = editName.value.trim()
  if (!name || !editId.value) return
  editing.value = true
  try {
    await $fetch('/api/admin/structures', {
      method: 'PATCH',
      body: {
        id: editId.value,
        name,
        is_prado: editIsPrado.value,
        type: editType.value || null,
        postal_code: editPostalCode.value || null,
        city: editCity.value || null,
      },
    })
    toast.success('Structure mise a jour')
    showEditModal.value = false
    loading.value = true
    await loadStructures()
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur')
  } finally {
    editing.value = false
  }
}

// ─── Delete ───
const { confirm } = useConfirm()

async function handleDelete(structure: AdminStructure) {
  if (structure.prescripteurs_count > 0) {
    toast.error('Impossible : des prescripteurs sont rattachés à cette structure')
    return
  }
  const ok = await confirm(`Supprimer la structure "${structure.name}" ?`, { variant: 'danger' })
  if (!ok) return
  try {
    await $fetch('/api/admin/structures', { method: 'DELETE', body: { id: structure.id } })
    toast.success('Structure supprimée')
    structures.value = structures.value.filter(s => s.id !== structure.id)
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur')
  }
}

// ─── Export ───
function handleExport() {
  const headers = ['Nom', 'Prescripteurs', 'Jeunes', 'Date creation']
  const rows = structures.value.map(s => [
    s.name,
    String(s.prescripteurs_count),
    String(s.jeunes_count),
    new Date(s.created_at).toLocaleDateString('fr-FR'),
  ])
  exportToCsv('structures.csv', headers, rows)
  toast.success('Export CSV téléchargé')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Structures</h1>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:opacity-90 transition-opacity"
          @click="showAddModal = true"
        >
          <Plus :size="16" />
          Ajouter
        </button>
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-sage text-white text-sm hover:opacity-90 transition-opacity"
          @click="handleExport"
        >
          <Download :size="16" />
          Exporter CSV
        </button>
      </div>
    </div>

    <AdminTable
      :columns="columns"
      :rows="structures"
      :loading="loading"
      search-placeholder="Rechercher une structure..."
      empty-message="Aucune structure trouvée"
    >
      <template #cell-name="{ row, value }">
        <div class="flex items-center gap-2">
          <span class="text-prado-text font-medium">{{ value }}</span>
          <span v-if="row.is_prado" class="px-1.5 py-0.5 rounded text-[10px] bg-prado-teal/15 text-prado-teal">Prado</span>
        </div>
        <div v-if="row.type" class="text-xs text-prado-text-faint">{{ row.type }}</div>
      </template>
      <template #cell-city="{ row }">
        <span v-if="row.city || row.postal_code" class="text-prado-text-secondary">
          {{ [row.postal_code, row.city].filter(Boolean).join(' ') }}
        </span>
        <span v-else class="text-prado-text-faint">-</span>
      </template>
      <template #cell-prescripteurs_count="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-jeunes_count="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
      <template #actions="{ row }">
        <button
          class="p-1.5 rounded-lg text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover transition-colors"
          title="Renommer"
          @click="openEdit(row as unknown as AdminStructure)"
        >
          <Pencil :size="16" />
        </button>
        <button
          v-if="row.prescripteurs_count === 0"
          class="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          title="Supprimer"
          @click="handleDelete(row as unknown as AdminStructure)"
        >
          <Trash2 :size="16" />
        </button>
      </template>
    </AdminTable>

    <!-- Add modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showAddModal = false">
        <div class="rounded-2xl border border-prado-border p-6 w-full max-w-md mx-4 shadow-xl" style="background-color: var(--prado-surface)">
          <h3 class="text-lg font-semibold text-prado-text mb-4">Ajouter une structure</h3>
          <form class="space-y-3" @submit.prevent="handleAdd">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Nom de la structure *</label>
              <input
                v-model="newName"
                type="text"
                required
                autofocus
                placeholder="Ex: MECS Saint-Vincent"
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
              />
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Type</label>
              <input
                v-model="newType"
                type="text"
                placeholder="Ex: MECS, Foyer, IME..."
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Code postal</label>
                <input
                  v-model="newPostalCode"
                  type="text"
                  placeholder="69000"
                  maxlength="10"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
                />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Ville</label>
                <input
                  v-model="newCity"
                  type="text"
                  placeholder="Lyon"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
                />
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="newIsPrado"
                type="checkbox"
                class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
              />
              <span class="text-sm text-prado-text">Structure Prado</span>
            </label>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors"
                @click="showAddModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="adding"
                class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="adding" :size="14" class="animate-spin" />
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Edit modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showEditModal = false">
        <div class="rounded-2xl border border-prado-border p-6 w-full max-w-md mx-4 shadow-xl" style="background-color: var(--prado-surface)">
          <h3 class="text-lg font-semibold text-prado-text mb-4">Modifier la structure</h3>
          <form class="space-y-3" @submit.prevent="handleEdit">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Nom *</label>
              <input
                v-model="editName"
                type="text"
                required
                autofocus
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
              />
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Type</label>
              <input
                v-model="editType"
                type="text"
                placeholder="Ex: MECS, Foyer, IME..."
                class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Code postal</label>
                <input
                  v-model="editPostalCode"
                  type="text"
                  placeholder="69000"
                  maxlength="10"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
                />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Ville</label>
                <input
                  v-model="editCity"
                  type="text"
                  placeholder="Lyon"
                  class="w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors"
                />
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="editIsPrado"
                type="checkbox"
                class="rounded border-prado-border text-prado-teal focus:ring-prado-teal"
              />
              <span class="text-sm text-prado-text">Structure Prado</span>
            </label>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors"
                @click="showEditModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="editing"
                class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="editing" :size="14" class="animate-spin" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
