<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface AdminJeune {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  situation: string | null
  created_at: string
  prescripteur_name: string | null
  inscriptions_count: number
}

const jeunes = ref<AdminJeune[]>([])
const loading = ref(true)

const columns: AdminTableColumn[] = [
  { key: 'full_name', label: 'Nom complet', sortable: true },
  { key: 'date_of_birth', label: 'Date de naissance', sortable: true, hiddenBelow: 'lg' },
  { key: 'situation', label: 'Situation', sortable: true, hiddenBelow: 'md' },
  { key: 'prescripteur_name', label: 'Prescripteur', sortable: true, hiddenBelow: 'md' },
  { key: 'inscriptions_count', label: 'Inscriptions', sortable: true },
  { key: 'created_at', label: 'Date creation', sortable: true, hiddenBelow: 'xl' },
]

const rows = computed(() =>
  jeunes.value.map(j => ({
    ...j,
    full_name: `${j.first_name} ${j.last_name}`,
  }))
)

onMounted(async () => {
  try {
    jeunes.value = await $fetch<AdminJeune[]>('/api/admin/jeunes')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
})

function handleExport() {
  const headers = ['Prenom', 'Nom', 'Date de naissance', 'Situation', 'Prescripteur', 'Inscriptions', 'Date creation']
  const csvRows = jeunes.value.map(j => [
    j.first_name,
    j.last_name,
    j.date_of_birth ? new Date(j.date_of_birth).toLocaleDateString('fr-FR') : '',
    j.situation ?? '',
    j.prescripteur_name ?? '',
    String(j.inscriptions_count),
    new Date(j.created_at).toLocaleDateString('fr-FR'),
  ])
  exportToCsv('jeunes.csv', headers, csvRows)
  toast.success('Export CSV telecharge')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Jeunes ({{ jeunes.length }})</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity"
        @click="handleExport"
      >
        <Download :size="16" />
        Exporter CSV
      </button>
    </div>

    <AdminTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      search-placeholder="Rechercher un jeune..."
      empty-message="Aucun jeune trouve"
    >
      <template #cell-full_name="{ row }">
        <span class="text-prado-text font-medium">{{ row.full_name }}</span>
      </template>
      <template #cell-date_of_birth="{ value }">
        <span class="text-prado-text-muted">{{ value ? new Date(value).toLocaleDateString('fr-FR') : '-' }}</span>
      </template>
      <template #cell-situation="{ value }">
        <span v-if="value" class="px-2 py-0.5 rounded-full text-xs bg-prado-tag-bg text-prado-text-muted">{{ value }}</span>
        <span v-else class="text-prado-text-faint">-</span>
      </template>
      <template #cell-prescripteur_name="{ value }">
        <span class="text-prado-text-secondary">{{ value ?? '-' }}</span>
      </template>
      <template #cell-inscriptions_count="{ value }">
        <span class="text-prado-text">{{ value }}</span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
    </AdminTable>
  </div>
</template>
