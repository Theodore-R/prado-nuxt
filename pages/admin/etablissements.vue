<script setup lang="ts">
import { Plus, Pencil, Trash2, Download, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'
import type { Etablissement } from '~/lib/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const etablissements = ref<Etablissement[]>([])
const loading = ref(true)

const columns: PrDataTableColumn[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'city', label: 'Ville', sortable: true, hiddenBelow: 'sm' },
  { key: 'postalCode', label: 'Code postal', sortable: true, hiddenBelow: 'md' },
  { key: 'createdAt', label: 'Date creation', sortable: true, hiddenBelow: 'lg' },
]

async function loadData() {
  try {
    etablissements.value = await $fetch<Etablissement[]>('/api/admin/etablissements')
  } catch {
    toast.error('Erreur chargement etablissements')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

// ─── Add modal ───
const showAddModal = ref(false)
const newName = ref('')
const newAddress = ref('')
const newPostalCode = ref('')
const newCity = ref('')
const adding = ref(false)

async function handleAdd() {
  const name = newName.value.trim()
  if (!name) return
  adding.value = true
  try {
    const created = await $fetch<Etablissement>('/api/admin/etablissements', {
      method: 'POST',
      body: {
        name,
        address: newAddress.value || undefined,
        postalCode: newPostalCode.value || undefined,
        city: newCity.value || undefined,
      },
    })
    etablissements.value = [...etablissements.value, created].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    toast.success('Etablissement cree')
    showAddModal.value = false
    newName.value = ''
    newAddress.value = ''
    newPostalCode.value = ''
    newCity.value = ''
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
const editAddress = ref('')
const editPostalCode = ref('')
const editCity = ref('')
const editing = ref(false)

function openEdit(etab: Etablissement) {
  editId.value = etab.id
  editName.value = etab.name
  editAddress.value = etab.address ?? ''
  editPostalCode.value = etab.postalCode ?? ''
  editCity.value = etab.city ?? ''
  showEditModal.value = true
}

async function handleEdit() {
  const name = editName.value.trim()
  if (!name || !editId.value) return
  editing.value = true
  try {
    const updated = await $fetch<Etablissement>(`/api/admin/etablissements/${editId.value}`, {
      method: 'PATCH',
      body: {
        name,
        address: editAddress.value || undefined,
        postalCode: editPostalCode.value || undefined,
        city: editCity.value || undefined,
      },
    })
    etablissements.value = etablissements.value.map(e => e.id === editId.value ? updated : e)
    toast.success('Etablissement mis a jour')
    showEditModal.value = false
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur')
  } finally {
    editing.value = false
  }
}

// ─── Delete ───
const { confirm } = useConfirm()

async function handleDelete(etab: Etablissement) {
  const ok = await confirm(`Supprimer l'etablissement "${etab.name}" ?`, { variant: 'danger' })
  if (!ok) return
  try {
    await $fetch(`/api/admin/etablissements/${etab.id}`, { method: 'DELETE' })
    etablissements.value = etablissements.value.filter(e => e.id !== etab.id)
    toast.success('Etablissement supprime')
  } catch (err: any) {
    toast.error(err.data?.message ?? 'Erreur')
  }
}

// ─── Export ───
function handleExport() {
  exportToCsv(
    'etablissements.csv',
    ['Nom', 'Adresse', 'Code postal', 'Ville'],
    etablissements.value.map(e => [
      e.name,
      e.address ?? '',
      e.postalCode ?? '',
      e.city ?? '',
    ]),
  )
  toast.success('Export CSV telecharge')
}

</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Etablissements</h1>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:opacity-90 transition-opacity"
          @click="showAddModal = true"
        >
          <Plus :size="16" /> Ajouter
        </button>
        <button
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-sage text-white text-sm hover:opacity-90 transition-opacity"
          @click="handleExport"
        >
          <Download :size="16" /> CSV
        </button>
      </div>
    </div>

    <PrDataTable
      :columns="columns"
      :rows="etablissements"
      :loading="loading"
      search-placeholder="Rechercher un etablissement..."
      empty-message="Aucun etablissement"
    >
      <template #cell-name="{ value }">
        <span class="text-prado-text font-medium">{{ value }}</span>
      </template>
      <template #cell-city="{ value }">
        <span class="text-prado-text-secondary">{{ value ?? '-' }}</span>
      </template>
      <template #cell-postalCode="{ value }">
        <span class="text-prado-text-secondary">{{ value ?? '-' }}</span>
      </template>
      <template #cell-createdAt="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
      <template #actions="{ row }">
        <button
          class="p-1.5 rounded-lg text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover transition-colors"
          title="Modifier"
          @click="openEdit(row as unknown as Etablissement)"
        >
          <Pencil :size="16" />
        </button>
        <button
          class="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          title="Supprimer"
          @click="handleDelete(row as unknown as Etablissement)"
        >
          <Trash2 :size="16" />
        </button>
      </template>
    </PrDataTable>

    <!-- Add modal -->
    <PrDialog :open="showAddModal" title="Ajouter un etablissement" @update:open="showAddModal = $event" @cancel="showAddModal = false">
      <form class="space-y-3" @submit.prevent="handleAdd">
        <PrInput v-model="newName" label="Nom *" placeholder="Nom de l'etablissement" required />
        <PrInput v-model="newAddress" label="Adresse" placeholder="Adresse" />
        <div class="grid grid-cols-2 gap-3">
          <PrInput v-model="newPostalCode" label="Code postal" placeholder="69000" />
          <PrInput v-model="newCity" label="Ville" placeholder="Lyon" />
        </div>
      </form>
      <template #footer>
        <PrButton variant="ghost" @click="showAddModal = false">Annuler</PrButton>
        <PrButton variant="primary" :loading="adding" @click="handleAdd">Creer</PrButton>
      </template>
    </PrDialog>

    <!-- Edit modal -->
    <PrDialog :open="showEditModal" title="Modifier l'etablissement" @update:open="showEditModal = $event" @cancel="showEditModal = false">
      <form class="space-y-3" @submit.prevent="handleEdit">
        <PrInput v-model="editName" label="Nom *" required />
        <PrInput v-model="editAddress" label="Adresse" />
        <div class="grid grid-cols-2 gap-3">
          <PrInput v-model="editPostalCode" label="Code postal" placeholder="69000" />
          <PrInput v-model="editCity" label="Ville" placeholder="Lyon" />
        </div>
      </form>
      <template #footer>
        <PrButton variant="ghost" @click="showEditModal = false">Annuler</PrButton>
        <PrButton variant="primary" :loading="editing" @click="handleEdit">Enregistrer</PrButton>
      </template>
    </PrDialog>
  </div>
</template>
