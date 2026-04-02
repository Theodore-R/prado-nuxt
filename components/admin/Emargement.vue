<script setup lang="ts">
import { Loader2, Check, X, Save } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  actionId: string | number
}>()

interface PresenceRow {
  inscriptionId: string
  jeuneId: string
  jeuneFirstName: string
  jeuneLastName: string
  presence: 'inscrit' | 'present' | 'absent'
  accompagnateurPresent: boolean
  nomsAccompagnateurs: string | null
}

interface FeuillePresence {
  action: {
    id: number
    title: string
    category: string
    date: string | null
    time: string | null
  }
  dates: Array<{ id: string; date: string; time: string }>
  inscriptions: PresenceRow[]
  stats: {
    totalInscrits: number
    totalPresents: number
    totalAbsents: number
    tauxPresence: number
  }
}

const data = ref<FeuillePresence | null>(null)
const loading = ref(true)
const saving = ref(false)
const localPresence = ref<Map<string, 'inscrit' | 'present' | 'absent'>>(new Map())

async function load() {
  loading.value = true
  try {
    const result = await $fetch<FeuillePresence>(
      `/api/admin/inscriptions/feuille-presence/${props.actionId}`,
    )
    data.value = result
    localPresence.value = new Map(
      result.inscriptions.map(i => [i.inscriptionId, i.presence]),
    )
  } catch {
    toast.error('Erreur chargement feuille de presence')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function togglePresence(inscriptionId: string, value: 'present' | 'absent') {
  const current = localPresence.value.get(inscriptionId)
  const newMap = new Map(localPresence.value)
  newMap.set(inscriptionId, current === value ? 'inscrit' : value)
  localPresence.value = newMap
}

const changedIds = computed(() => {
  if (!data.value) return []
  return data.value.inscriptions
    .filter(i => localPresence.value.get(i.inscriptionId) !== i.presence)
    .map(i => i.inscriptionId)
})

const hasChanges = computed(() => changedIds.value.length > 0)

async function handleSave() {
  if (!data.value) return

  const presentIds = data.value.inscriptions
    .filter(i => localPresence.value.get(i.inscriptionId) === 'present' && i.presence !== 'present')
    .map(i => i.inscriptionId)

  const absentIds = data.value.inscriptions
    .filter(i => localPresence.value.get(i.inscriptionId) === 'absent' && i.presence !== 'absent')
    .map(i => i.inscriptionId)

  const inscritIds = data.value.inscriptions
    .filter(i => localPresence.value.get(i.inscriptionId) === 'inscrit' && i.presence !== 'inscrit')
    .map(i => i.inscriptionId)

  saving.value = true
  try {
    const requests: Promise<unknown>[] = []
    if (presentIds.length > 0) {
      requests.push(($fetch as any)('/api/admin/inscriptions/presence', {
        method: 'PATCH',
        body: { inscriptionIds: presentIds, presence: 'present' },
      }))
    }
    if (absentIds.length > 0) {
      requests.push(($fetch as any)('/api/admin/inscriptions/presence', {
        method: 'PATCH',
        body: { inscriptionIds: absentIds, presence: 'absent' },
      }))
    }
    await Promise.all(requests)
    toast.success('Presence enregistree')
    await load()
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const localStats = computed(() => {
  const values = [...localPresence.value.values()]
  const total = values.length
  const presents = values.filter(v => v === 'present').length
  const absents = values.filter(v => v === 'absent').length
  return {
    total,
    presents,
    absents,
    enAttente: total - presents - absents,
    taux: total > 0 ? Math.round((presents / total) * 100) : 0,
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 :size="24" class="animate-spin text-prado-text-muted" />
    </div>

    <template v-else-if="data">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-sm font-semibold text-prado-text">{{ data.action.title }}</h3>
          <p class="text-xs text-prado-text-muted">{{ data.inscriptions.length }} inscrits</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-4 text-xs text-prado-text-muted">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500" /> {{ localStats.presents }} P</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400" /> {{ localStats.absents }} A</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-prado-border" /> {{ localStats.enAttente }} ?</span>
          </div>
          <button
            :disabled="!hasChanges || saving"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-prado-teal text-white text-sm disabled:opacity-50 transition-opacity"
            @click="handleSave"
          >
            <Loader2 v-if="saving" :size="14" class="animate-spin" />
            <Save v-else :size="14" />
            Enregistrer
          </button>
        </div>
      </div>

      <div v-if="data.inscriptions.length === 0" class="text-sm text-prado-text-muted text-center py-8">
        Aucun inscrit pour cette action.
      </div>

      <div v-else class="bg-prado-surface rounded-2xl border border-prado-border divide-y divide-prado-border">
        <div
          v-for="row in data.inscriptions"
          :key="row.inscriptionId"
          class="flex items-center gap-3 px-4 py-3"
        >
          <span class="flex-1 text-sm text-prado-text">
            {{ row.jeuneFirstName }} {{ row.jeuneLastName }}
          </span>
          <div class="flex items-center gap-1.5">
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              :class="localPresence.get(row.inscriptionId) === 'present'
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-prado-surface-hover text-prado-text-faint hover:text-emerald-500'"
              title="Present"
              @click="togglePresence(row.inscriptionId, 'present')"
            >
              <Check :size="16" />
            </button>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              :class="localPresence.get(row.inscriptionId) === 'absent'
                ? 'bg-red-500/15 text-red-400'
                : 'bg-prado-surface-hover text-prado-text-faint hover:text-red-400'"
              title="Absent"
              @click="togglePresence(row.inscriptionId, 'absent')"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
