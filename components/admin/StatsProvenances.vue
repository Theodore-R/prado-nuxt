<script setup lang="ts">
import { Loader2, MapPin } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  year: string
}>()

interface ProvenanceStats {
  year: string
  repartitionCodePostal: Record<string, number>
  repartitionStructure: Record<string, number>
  repartitionAccompagnement: Record<string, number>
}

const data = ref<ProvenanceStats | null>(null)
const loading = ref(true)

const accompagnementLabels: Record<string, string> = {
  ase: 'ASE',
  pjj: 'PJJ',
  mission_locale: 'Mission locale',
  prevention_specialisee: 'Prevention specialisee',
  insertion: 'Insertion',
  handicap: 'Handicap',
  autre: 'Autre',
  non_renseigne: 'Non renseigne',
}

async function load() {
  loading.value = true
  try {
    data.value = await $fetch<ProvenanceStats>('/api/admin/stats/provenances', {
      query: { year: props.year },
    })
  } catch {
    toast.error('Erreur chargement stats provenances')
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
      <MapPin :size="16" class="text-prado-text-faint" />
      <h3 class="text-sm font-semibold text-prado-text">Provenances</h3>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <Loader2 :size="20" class="animate-spin text-prado-text-muted" />
    </div>

    <template v-else-if="data">
      <!-- By structure -->
      <div class="mb-5">
        <p class="text-xs text-prado-text-muted mb-2 font-medium">Par structure</p>
        <div v-if="Object.keys(data.repartitionStructure).length === 0" class="text-xs text-prado-text-faint">
          Aucune donnee
        </div>
        <div v-else class="space-y-2">
          <div v-for="[key, count] in sortedEntries(data.repartitionStructure)" :key="key" class="flex items-center gap-3">
            <span class="text-xs text-prado-text-secondary w-32 shrink-0 truncate" :title="key">{{ key }}</span>
            <div class="flex-1 h-5 rounded-full bg-prado-bg-deep overflow-hidden">
              <div
                class="h-full rounded-full bg-[#024266] transition-all duration-500"
                :style="{ width: `${(count / maxValue(data.repartitionStructure)) * 100}%` }"
              />
            </div>
            <span class="text-xs text-prado-text font-medium w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- By postal code -->
      <div class="mb-5">
        <p class="text-xs text-prado-text-muted mb-2 font-medium">Par code postal</p>
        <div v-if="Object.keys(data.repartitionCodePostal).length === 0" class="text-xs text-prado-text-faint">
          Aucune donnee
        </div>
        <div v-else class="space-y-2">
          <div v-for="[key, count] in sortedEntries(data.repartitionCodePostal)" :key="key" class="flex items-center gap-3">
            <span class="text-xs text-prado-text-secondary w-20 shrink-0">{{ key }}</span>
            <div class="flex-1 h-5 rounded-full bg-prado-bg-deep overflow-hidden">
              <div
                class="h-full rounded-full bg-[#FB6223] transition-all duration-500"
                :style="{ width: `${(count / maxValue(data.repartitionCodePostal)) * 100}%` }"
              />
            </div>
            <span class="text-xs text-prado-text font-medium w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- By accompagnement type -->
      <div>
        <p class="text-xs text-prado-text-muted mb-2 font-medium">Par type d'accompagnement</p>
        <div v-if="Object.keys(data.repartitionAccompagnement).length === 0" class="text-xs text-prado-text-faint">
          Aucune donnee
        </div>
        <div v-else class="space-y-2">
          <div v-for="[key, count] in sortedEntries(data.repartitionAccompagnement)" :key="key" class="flex items-center gap-3">
            <span class="text-xs text-prado-text-secondary w-28 shrink-0 truncate" :title="accompagnementLabels[key] ?? key">
              {{ accompagnementLabels[key] ?? key }}
            </span>
            <div class="flex-1 h-5 rounded-full bg-prado-bg-deep overflow-hidden">
              <div
                class="h-full rounded-full bg-prado-teal transition-all duration-500"
                :style="{ width: `${(count / maxValue(data.repartitionAccompagnement)) * 100}%` }"
              />
            </div>
            <span class="text-xs text-prado-text font-medium w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
