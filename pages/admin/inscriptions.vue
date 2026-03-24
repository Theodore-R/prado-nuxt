<script setup lang="ts">
import { Loader2, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  fetchAllInscriptions,
  fetchAllActions,
  type AdminInscription,
} from '~/lib/adminApi'
import { exportToCsv } from '~/utils/csvExport'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const client = useSupabaseClient()
const inscriptions = ref<AdminInscription[]>([])
const actionsMap = ref<Record<string, string>>({})
const loading = ref(true)

// Fetch inscriptions and actions from Supabase (auth-gated, must run client-side)
onMounted(async () => {
  try {
    const [inscriptionsData, actionsData] = await Promise.all([
      fetchAllInscriptions(client),
      fetchAllActions(client),
    ])
    inscriptions.value = inscriptionsData
    const map: Record<string, string> = {}
    for (const action of actionsData) {
      map[String(action.id)] = action.title
    }
    actionsMap.value = map
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
})

function handleExport() {
  const headers = ['Jeune', 'Action', 'Prescripteur', 'Date']
  const rows = inscriptions.value.map(i => [
    i.jeunes ? `${i.jeunes.first_name} ${i.jeunes.last_name}` : '-',
    actionsMap.value[i.action_id] ?? i.action_id,
    i.prescripteurs?.name ?? '-',
    new Date(i.created_at).toLocaleDateString('fr-FR'),
  ])
  exportToCsv('inscriptions.csv', headers, rows)
  toast.success('Export CSV telecharge')
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Inscriptions</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity"
        @click="handleExport"
      >
        <Download :size="16" />
        Exporter CSV
      </button>
    </div>

    <!-- Table -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-prado-border">
              <th class="text-left px-4 py-3 text-prado-text-secondary font-medium">Jeune</th>
              <th class="text-left px-4 py-3 text-prado-text-secondary font-medium">Action</th>
              <th class="text-left px-4 py-3 text-prado-text-secondary font-medium hidden md:table-cell">Prescripteur</th>
              <th class="text-left px-4 py-3 text-prado-text-secondary font-medium hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="i in inscriptions"
              :key="i.id"
              class="border-b border-prado-border last:border-0 hover:bg-prado-surface-hover"
            >
              <td class="px-4 py-3 text-prado-text">
                {{ i.jeunes ? `${i.jeunes.first_name} ${i.jeunes.last_name}` : '-' }}
              </td>
              <td class="px-4 py-3 text-prado-text">
                {{ actionsMap[i.action_id] ?? i.action_id }}
              </td>
              <td class="px-4 py-3 text-prado-text-secondary hidden md:table-cell">
                {{ i.prescripteurs?.name ?? '-' }}
              </td>
              <td class="px-4 py-3 text-prado-text-muted hidden lg:table-cell">
                {{ new Date(i.created_at).toLocaleDateString('fr-FR') }}
              </td>
            </tr>
            <tr v-if="inscriptions.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-prado-text-muted">
                Aucune inscription trouvee
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
