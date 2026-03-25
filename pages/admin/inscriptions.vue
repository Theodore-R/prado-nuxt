<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AdminInscription } from '~/lib/adminApi'
import { exportToCsv } from '~/utils/csvExport'
import type { AdminTableColumn } from '~/components/admin/AdminTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const inscriptions = ref<AdminInscription[]>([])
const loading = ref(true)

const { data: actionsData } = await useAsyncData('admin-actions-map', () =>
  $fetch<{ id: number; title: string }[]>('/api/actions/map'),
)

const actionsMap = computed(() => {
  const map: Record<string, string> = {}
  for (const a of actionsData.value ?? []) {
    map[String(a.id)] = a.title
  }
  return map
})

const columns: AdminTableColumn[] = [
  { key: 'jeune_name', label: 'Jeune', sortable: true },
  { key: 'action_name', label: 'Action', sortable: true },
  { key: 'prescripteur_name', label: 'Prescripteur', sortable: true, hiddenBelow: 'md' },
  { key: 'created_at', label: 'Date', sortable: true, hiddenBelow: 'lg' },
]

const rows = computed(() =>
  inscriptions.value.map(i => ({
    ...i,
    jeune_name: i.jeunes ? `${i.jeunes.first_name} ${i.jeunes.last_name}` : '-',
    action_name: actionsMap.value[i.action_id] ?? i.action_id,
    prescripteur_name: i.prescripteurs?.name ?? '-',
  }))
)

onMounted(async () => {
  try {
    inscriptions.value = await $fetch<AdminInscription[]>('/api/admin/inscriptions')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
})

function handleExport() {
  const headers = ['Jeune', 'Action', 'Prescripteur', 'Date']
  const csvRows = rows.value.map(r => [
    r.jeune_name,
    r.action_name,
    r.prescripteur_name,
    new Date(r.created_at).toLocaleDateString('fr-FR'),
  ])
  exportToCsv('inscriptions.csv', headers, csvRows)
  toast.success('Export CSV telecharge')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Inscriptions ({{ inscriptions.length }})</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity"
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
      search-placeholder="Rechercher une inscription..."
      empty-message="Aucune inscription trouvee"
    >
      <template #cell-jeune_name="{ value }">
        <span class="text-prado-text">{{ value }}</span>
      </template>
      <template #cell-action_name="{ value }">
        <span class="text-prado-text">{{ value }}</span>
      </template>
      <template #cell-prescripteur_name="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
    </AdminTable>
  </div>
</template>
