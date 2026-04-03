<script setup lang="ts">
import { Download, Check, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { PrDataTableColumn } from '@theodoreriant/prado-ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface Subscriber {
  id: string; email: string; structure: string | null; source: string;
  subscribed_at: string; confirmed_at: string | null;
}

const subscribers = ref<Subscriber[]>([])
const loading = ref(true)

const columns: PrDataTableColumn[] = [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'structure', label: 'Structure', sortable: true, hiddenBelow: 'md' },
  { key: 'source', label: 'Source', sortable: true, hiddenBelow: 'lg' },
  { key: 'subscribed_at', label: 'Date', sortable: true },
  { key: 'confirmed_at', label: 'Confirme', sortable: true },
]

onMounted(async () => {
  try {
    subscribers.value = await $fetch<Subscriber[]>('/api/admin/newsletter')
  } catch { toast.error('Erreur chargement newsletter') }
  finally { loading.value = false }
})

async function handleExport() {
  window.open('/api/admin/newsletter/export', '_blank')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-xl font-semibold text-prado-text italic">Inscrits Newsletter ({{ subscribers.length }})</h1>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity"
        @click="handleExport"
      >
        <Download :size="16" />
        Export CSV
      </button>
    </div>

    <PrDataTable
      :columns="columns"
      :rows="subscribers"
      :loading="loading"
      search-placeholder="Rechercher un abonne..."
      empty-message="Aucun abonne"
    >
      <template #cell-email="{ value }">
        <span class="text-prado-text">{{ value }}</span>
      </template>
      <template #cell-structure="{ value }">
        <span class="text-prado-text-muted">{{ value || '-' }}</span>
      </template>
      <template #cell-source="{ value }">
        <span class="text-prado-text-muted">{{ value }}</span>
      </template>
      <template #cell-subscribed_at="{ value }">
        <span class="text-prado-text-muted">{{ new Date(value).toLocaleDateString('fr-FR') }}</span>
      </template>
      <template #cell-confirmed_at="{ value }">
        <Check v-if="value" :size="16" class="text-[#93C1AF]" />
        <X v-else :size="16" class="text-prado-text-faint" />
      </template>
    </PrDataTable>
  </div>
</template>
