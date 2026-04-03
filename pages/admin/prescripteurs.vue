<script setup lang="ts">
import { Download, CheckCircle, XCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AdminPrescripteur } from '~/lib/adminApi'
import { exportToCsv } from '~/utils/csvExport'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

const prescripteurs = ref<AdminPrescripteur[]>([])
const loading = ref(true)
const filter = ref<FilterTab>('all')

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuves' },
  { key: 'rejected', label: 'Rejetes' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: 'Approuve', className: 'bg-[#93C1AF]/20 text-[#93C1AF]' },
  pending: { label: 'En attente', className: 'bg-amber-500/20 text-amber-500' },
  rejected: { label: 'Rejete', className: 'bg-red-500/20 text-red-400' },
}

const columns: PrDataTableColumn[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'professional_email', label: 'Email', sortable: true, hiddenBelow: 'md' },
  { key: 'structure', label: 'Structure', sortable: true, hiddenBelow: 'lg' },
  { key: 'status', label: 'Statut', sortable: true },
  { key: 'role', label: 'Role', sortable: true, hiddenBelow: 'lg' },
  { key: 'created_at', label: 'Date', sortable: true, hiddenBelow: 'xl' },
]

const filtered = computed(() =>
  filter.value === 'all'
    ? prescripteurs.value
    : prescripteurs.value.filter(p => p.status === filter.value)
)

onMounted(async () => {
  try {
    prescripteurs.value = await $fetch<AdminPrescripteur[]>('/api/admin/prescripteurs')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
})

const { confirm } = useConfirm()

async function handleStatusChange(id: string, status: 'approved' | 'rejected') {
  const msg = status === 'approved' ? 'Approuver ce prescripteur ?' : 'Rejeter ce prescripteur ?'
  const ok = await confirm(msg, { variant: status === 'rejected' ? 'danger' : 'default' })
  if (!ok) return
  try {
    await $fetch('/api/admin/prescripteurs', { method: 'PATCH', body: { id, status } })
    prescripteurs.value = prescripteurs.value.map(p =>
      p.id === id ? { ...p, status } : p
    )
    toast.success(status === 'approved' ? 'Compte approuve' : 'Compte rejete')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}

function handleExport() {
  const headers = ['Nom', 'Email', 'Structure', 'Statut', 'Role', 'Date']
  const rows = filtered.value.map(p => [
    p.name,
    p.professional_email,
    p.structure,
    p.status,
    p.role,
    new Date(p.created_at).toLocaleDateString('fr-FR'),
  ])
  exportToCsv('prescripteurs.csv', headers, rows)
  toast.success('Export CSV telecharge')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Prescripteurs</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity"
        @click="handleExport"
      >
        <Download :size="16" />
        Exporter CSV
      </button>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="{ key, label } in tabs"
        :key="key"
        :class="[
          'px-4 py-1.5 rounded-full text-sm transition-colors',
          filter === key
            ? 'bg-prado-sage text-white'
            : 'bg-prado-tag-bg text-prado-text-secondary hover:text-prado-text',
        ]"
        @click="filter = key"
      >
        {{ label }}
      </button>
    </div>

    <PrDataTable
      :columns="columns"
      :rows="filtered"
      :loading="loading"
      search-placeholder="Rechercher un prescripteur..."
      empty-message="Aucun prescripteur trouve"
    >
      <template #cell-name="{ value }">
        <span class="text-prado-text">{{ value }}</span>
      </template>
      <template #cell-professional_email="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-structure="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-status="{ value }">
        <span :class="['inline-block px-2.5 py-0.5 rounded-full text-xs', (statusConfig[value] ?? statusConfig.pending).className]">
          {{ (statusConfig[value] ?? statusConfig.pending).label }}
        </span>
      </template>
      <template #cell-role="{ value }">
        <span class="text-prado-text-secondary">{{ value }}</span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="row.status !== 'approved'"
          class="p-1.5 rounded-lg text-[#93C1AF] hover:bg-[#93C1AF]/10 transition-colors"
          title="Approuver"
          @click="handleStatusChange(row.id, 'approved')"
        >
          <CheckCircle :size="16" />
        </button>
        <button
          v-if="row.status !== 'rejected'"
          class="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          title="Rejeter"
          @click="handleStatusChange(row.id, 'rejected')"
        >
          <XCircle :size="16" />
        </button>
      </template>
    </PrDataTable>
  </div>
</template>
