<script setup lang="ts">
import { Loader2, Euro } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  year: string
}>()

interface BudgetStats {
  year: string
  totalBudget: number
  coutMoyenParAction: number
  ventilationParStructure: Record<string, number>
  totalActions: number
}

const data = ref<BudgetStats | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<BudgetStats>('/api/admin/stats/budget', {
      query: { year: props.year },
    })
  } catch {
    toast.error('Erreur chargement stats budget')
  } finally {
    loading.value = false
  }
}

watch(() => props.year, load, { immediate: true })

function maxValue(record: Record<string, number>): number {
  const values = Object.values(record)
  return values.length > 0 ? Math.max(...values) : 1
}

function sortedEntries(record: Record<string, number>): [string, number][] {
  return Object.entries(record).sort((a, b) => b[1] - a[1])
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <div class="bg-prado-surface rounded-2xl border border-prado-border p-5">
    <div class="flex items-center gap-2 mb-4">
      <Euro :size="16" class="text-prado-text-faint" />
      <h3 class="text-sm font-semibold text-prado-text">Budget</h3>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <Loader2 :size="20" class="animate-spin text-prado-text-muted" />
    </div>

    <template v-else-if="data">
      <!-- Key metrics -->
      <div class="grid grid-cols-3 gap-3 mb-5">
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-text">{{ formatCurrency(data.totalBudget) }}</p>
          <p class="text-xs text-prado-text-muted">Total</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-text">{{ formatCurrency(data.coutMoyenParAction) }}</p>
          <p class="text-xs text-prado-text-muted">Cout moyen / action</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-text">{{ data.totalActions }}</p>
          <p class="text-xs text-prado-text-muted">Actions</p>
        </div>
      </div>

      <!-- Ventilation by structure -->
      <div>
        <p class="text-xs text-prado-text-muted mb-2 font-medium">Ventilation par etablissement</p>
        <div v-if="Object.keys(data.ventilationParStructure).length === 0" class="text-xs text-prado-text-faint">
          Aucune donnee
        </div>
        <div v-else class="space-y-2">
          <div v-for="[key, amount] in sortedEntries(data.ventilationParStructure)" :key="key" class="flex items-center gap-3">
            <span class="text-xs text-prado-text-secondary w-32 shrink-0 truncate" :title="key">{{ key }}</span>
            <div class="flex-1 h-5 rounded-full bg-prado-bg-deep overflow-hidden">
              <div
                class="h-full rounded-full bg-[#FB6223] transition-all duration-500"
                :style="{ width: `${(amount / maxValue(data.ventilationParStructure)) * 100}%` }"
              />
            </div>
            <span class="text-xs text-prado-text font-medium w-20 text-right">{{ formatCurrency(amount) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
