<script setup lang="ts">
import { Loader2, CalendarDays } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  year: string
}>()

interface ActionStats {
  year: string
  totalActions: number
  repartitionCategorie: Record<string, number>
  totalInscrits: number
  totalPresents: number
  tauxParticipation: number
  jeunesAvecInscription: number
  jeunesFideles: number
  tauxFidelisation: number
}

const data = ref<ActionStats | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<ActionStats>('/api/admin/stats/actions', {
      query: { year: props.year },
    })
  } catch {
    toast.error('Erreur chargement stats actions')
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
</script>

<template>
  <div class="bg-prado-surface rounded-2xl border border-prado-border p-5">
    <div class="flex items-center gap-2 mb-4">
      <CalendarDays :size="16" class="text-prado-text-faint" />
      <h3 class="text-sm font-semibold text-prado-text">Actions</h3>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <Loader2 :size="20" class="animate-spin text-prado-text-muted" />
    </div>

    <template v-else-if="data">
      <!-- Key metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-text">{{ data.totalActions }}</p>
          <p class="text-xs text-prado-text-muted">Actions</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-text">{{ data.totalInscrits }}</p>
          <p class="text-xs text-prado-text-muted">Inscrits</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-prado-teal">{{ data.tauxParticipation }}%</p>
          <p class="text-xs text-prado-text-muted">Participation</p>
        </div>
        <div class="text-center p-3 rounded-xl bg-prado-bg-deep">
          <p class="text-xl font-semibold text-[#93C1AF]">{{ data.tauxFidelisation }}%</p>
          <p class="text-xs text-prado-text-muted">Fidelisation</p>
        </div>
      </div>

      <!-- Category repartition -->
      <div>
        <p class="text-xs text-prado-text-muted mb-2 font-medium">Par categorie</p>
        <div v-if="Object.keys(data.repartitionCategorie).length === 0" class="text-xs text-prado-text-faint">
          Aucune donnee
        </div>
        <div v-else class="space-y-2">
          <div v-for="[key, count] in sortedEntries(data.repartitionCategorie)" :key="key" class="flex items-center gap-3">
            <span class="text-xs text-prado-text-secondary w-32 shrink-0 truncate" :title="key">{{ key }}</span>
            <div class="flex-1 h-5 rounded-full bg-prado-bg-deep overflow-hidden">
              <div
                class="h-full rounded-full bg-prado-sage transition-all duration-500"
                :style="{ width: `${(count / maxValue(data.repartitionCategorie)) * 100}%` }"
              />
            </div>
            <span class="text-xs text-prado-text font-medium w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
