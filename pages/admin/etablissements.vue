<script setup lang="ts">
import { Plus, Pencil, Trash2, Download, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'
import type { Etablissement } from '~/lib/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const etablissements = ref<Etablissement[]>([])
const loading = ref(true)

const columns: AdminTableColumn[] = [
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

const inputClass = 'w-full px-4 py-3 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-sage/50 transition-colors'
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

    <AdminTable
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
    </AdminTable>

    <!-- Add modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="showAddModal = false">
        <div class="rounded-2xl border border-prado-border p-6 w-full max-w-md mx-4 shadow-xl" style="background-color: var(--prado-surface)">
          <h3 class="text-lg font-semibold text-prado-text mb-4">Ajouter un etablissement</h3>
          <form class="space-y-3" @submit.prevent="handleAdd">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Nom *</label>
              <input v-model="newName" type="text" required autofocus placeholder="Nom de l'etablissement" :class="inputClass" />
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Adresse</label>
              <input v-model="newAddress" type="text" placeholder="Adresse" :class="inputClass" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Code postal</label>
                <input v-model="newPostalCode" type="text" placeholder="69000" maxlength="10" :class="inputClass" />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Ville</label>
                <input v-model="newCity" type="text" placeholder="Lyon" :class="inputClass" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors" @click="showAddModal = false">
                Annuler
              </button>
              <button type="submit" :disabled="adding" class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2">
                <Loader2 v-if="adding" :size="14" class="animate-spin" />
                Creer
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
          <h3 class="text-lg font-semibold text-prado-text mb-4">Modifier l'etablissement</h3>
          <form class="space-y-3" @submit.prevent="handleEdit">
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Nom *</label>
              <input v-model="editName" type="text" required autofocus :class="inputClass" />
            </div>
            <div>
              <label class="text-sm text-prado-text-secondary mb-1.5 block">Adresse</label>
              <input v-model="editAddress" type="text" :class="inputClass" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Code postal</label>
                <input v-model="editPostalCode" type="text" maxlength="10" :class="inputClass" />
              </div>
              <div>
                <label class="text-sm text-prado-text-secondary mb-1.5 block">Ville</label>
                <input v-model="editCity" type="text" :class="inputClass" />
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="px-4 py-2 rounded-full text-sm text-prado-text-muted hover:text-prado-text transition-colors" @click="showEditModal = false">
                Annuler
              </button>
              <button type="submit" :disabled="editing" class="px-5 py-2 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm disabled:opacity-50 flex items-center gap-2">
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
