<script setup lang="ts">
import { Download, Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'

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

const columns: PrDataTableColumn[] = [
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

    <PrDataTable
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
    </PrDataTable>

    <!-- Add modal -->
    <PrDialog :open="showAddModal" title="Ajouter une structure" @update:open="showAddModal = $event" @cancel="showAddModal = false">
      <form class="space-y-3" @submit.prevent="handleAdd">
        <PrInput v-model="newName" label="Nom de la structure *" placeholder="Ex: MECS Saint-Vincent" required />
        <PrInput v-model="newType" label="Type" placeholder="Ex: MECS, Foyer, IME..." />
        <div class="grid grid-cols-2 gap-3">
          <PrInput v-model="newPostalCode" label="Code postal" placeholder="69000" />
          <PrInput v-model="newCity" label="Ville" placeholder="Lyon" />
        </div>
        <PrCheckbox v-model="newIsPrado" label="Structure Prado" />
      </form>
      <template #footer>
        <PrButton variant="ghost" @click="showAddModal = false">Annuler</PrButton>
        <PrButton variant="primary" :loading="adding" @click="handleAdd">Créer</PrButton>
      </template>
    </PrDialog>

    <!-- Edit modal -->
    <PrDialog :open="showEditModal" title="Modifier la structure" @update:open="showEditModal = $event" @cancel="showEditModal = false">
      <form class="space-y-3" @submit.prevent="handleEdit">
        <PrInput v-model="editName" label="Nom *" required />
        <PrInput v-model="editType" label="Type" placeholder="Ex: MECS, Foyer, IME..." />
        <div class="grid grid-cols-2 gap-3">
          <PrInput v-model="editPostalCode" label="Code postal" placeholder="69000" />
          <PrInput v-model="editCity" label="Ville" placeholder="Lyon" />
        </div>
        <PrCheckbox v-model="editIsPrado" label="Structure Prado" />
      </form>
      <template #footer>
        <PrButton variant="ghost" @click="showEditModal = false">Annuler</PrButton>
        <PrButton variant="primary" :loading="editing" @click="handleEdit">Enregistrer</PrButton>
      </template>
    </PrDialog>
  </div>
</template>
