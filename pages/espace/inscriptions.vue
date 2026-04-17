<script setup lang="ts">
import { Trash2, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { exportToCsv } from '~/utils/csvExport'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const { jeunes, inscriptions, desinscrire } = useAuth()
const { confirm } = usePradoConfirm()

const filterJeune = ref('')
const filterYear = ref(String(new Date().getFullYear()))

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => String(currentYear - i))
})

const { data: actionsData } = await useAsyncData('espace-inscriptions-actions-map', () =>
  $fetch<{ id: number; title: string }[]>('/api/actions/map'),
)

const actionMap = computed(() => {
  const map = new Map<string, { id: number; title: string }>()
  for (const a of actionsData.value ?? []) {
    map.set(String(a.id), { id: a.id, title: a.title })
  }
  return map
})

const columns: PrDataTableColumn[] = [
  { key: 'jeuneName', label: 'Jeune', sortable: true },
  { key: 'actionTitle', label: 'Action', sortable: true },
  { key: 'dateDisplay', label: 'Date', sortable: true, hiddenBelow: 'sm' },
]

const allRows = computed(() =>
  inscriptions.value.map(insc => {
    const jeune = jeunes.value.find(j => j.id === insc.jeuneId)
    const action = actionMap.value.get(insc.actionId)
    return {
      id: insc.id,
      jeuneId: insc.jeuneId,
      jeuneName: jeune ? `${jeune.firstName} ${jeune.lastName}` : 'Inconnu',
      actionTitle: action?.title ?? 'Action inconnue',
      actionId: action?.id,
      date: insc.date,
      dateDisplay: new Date(insc.date).toLocaleDateString('fr-FR'),
    }
  }),
)

const rows = computed(() => {
  let result = allRows.value
  if (filterJeune.value) {
    result = result.filter(r => r.jeuneId === filterJeune.value)
  }
  if (filterYear.value) {
    result = result.filter(r => r.date.startsWith(filterYear.value))
  }
  return result
})

async function handleDesinscrire(inscriptionId: string, jeuneName: string, actionTitle: string) {
  const ok = await confirm(`Desinscrire ${jeuneName} de "${actionTitle}" ?`, { variant: 'warning' })
  if (!ok) return
  try {
    await desinscrire(inscriptionId)
    toast.info('Inscription annulee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}

function handleExport() {
  exportToCsv(
    'inscriptions.csv',
    ['Jeune', 'Action', 'Date'],
    rows.value.map(r => [r.jeuneName, r.actionTitle, r.dateDisplay]),
  )
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <h1 class="text-xl font-semibold text-prado-text italic">Inscriptions</h1>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <select
        v-model="filterJeune"
        class="px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium"
      >
        <option value="">Tous les jeunes</option>
        <option v-for="j in jeunes" :key="j.id" :value="j.id">
          {{ j.firstName }} {{ j.lastName }}
        </option>
      </select>
      <select
        v-model="filterYear"
        class="px-3 py-2 rounded-xl bg-prado-input-bg border border-prado-border text-prado-text text-sm focus:outline-none focus:border-prado-border-medium"
      >
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <PrDataTable
      :columns="columns"
      :rows="rows"
      search-placeholder="Rechercher..."
      empty-message="Aucune inscription"
    >
      <template #toolbar>
        <button
          v-if="rows.length > 0"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-prado-border text-sm text-prado-text-secondary hover:bg-prado-surface-hover transition-colors"
          @click="handleExport"
        >
          <Download :size="14" /> CSV
        </button>
      </template>

      <template #cell-actionTitle="{ row }">
        <NuxtLink
          v-if="row.actionId"
          :to="`/actions/${row.actionId}`"
          class="text-prado-teal hover:underline"
        >
          {{ row.actionTitle }}
        </NuxtLink>
        <span v-else class="text-prado-text">{{ row.actionTitle }}</span>
      </template>

      <template #actions="{ row }">
        <button
          class="p-1.5 rounded-lg hover:bg-red-500/10 text-prado-text-muted hover:text-red-400 transition-colors"
          title="Desinscrire"
          @click="handleDesinscrire(row.id, row.jeuneName, row.actionTitle)"
        >
          <Trash2 :size="15" />
        </button>
      </template>
    </PrDataTable>
  </div>
</template>
