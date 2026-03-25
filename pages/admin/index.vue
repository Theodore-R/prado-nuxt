<script setup lang="ts">
import {
  Users, UserCheck, ClipboardList, Clock, Mail, Newspaper,
  Loader2, CircleDot,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

interface DashboardStats {
  prescripteursCount: number
  jeunesCount: number
  inscriptionsCount: number
  pendingCount: number
  unreadContactsCount: number
  newsletterCount: number
}

interface ActivityItem {
  type: 'inscription' | 'prescripteur' | 'contact' | 'newsletter'
  label: string
  detail: string
  date: string
}

const stats = ref<DashboardStats | null>(null)
const activity = ref<ActivityItem[]>([])
const loading = ref(true)

const statCards = [
  { key: 'prescripteursCount' as const, label: 'Prescripteurs', icon: Users, color: '#CF006C' },
  { key: 'jeunesCount' as const, label: 'Jeunes', icon: UserCheck, color: '#FB6223' },
  { key: 'inscriptionsCount' as const, label: 'Inscriptions', icon: ClipboardList, color: '#93C1AF' },
  { key: 'pendingCount' as const, label: 'En attente', icon: Clock, color: '#C18ED8' },
  { key: 'unreadContactsCount' as const, label: 'Contacts non lus', icon: Mail, color: '#FB6223' },
  { key: 'newsletterCount' as const, label: 'Abonnes newsletter', icon: Newspaper, color: '#93C1AF' },
]

const activityColors: Record<string, string> = {
  inscription: '#93C1AF',
  prescripteur: '#C18ED8',
  contact: '#FB6223',
  newsletter: '#004657',
}

onMounted(async () => {
  try {
    const [statsData, activityData] = await Promise.all([
      $fetch<DashboardStats>('/api/admin/stats'),
      $fetch<ActivityItem[]>('/api/admin/activity'),
    ])
    stats.value = statsData
    activity.value = activityData
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur de chargement')
  } finally {
    loading.value = false
  }
})

function formatRelativeDate(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else class="max-w-6xl mx-auto space-y-8">
    <h1 class="text-xl font-semibold text-prado-text italic">Tableau de bord</h1>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="{ key, label, icon: Icon, color } in statCards"
        :key="key"
        class="bg-prado-surface rounded-2xl border border-prado-border p-5 flex items-center gap-4"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center"
          :style="{ backgroundColor: `${color}20` }"
        >
          <component :is="Icon" :size="20" :style="{ color }" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-prado-text">
            {{ stats ? stats[key] : '-' }}
          </p>
          <p class="text-xs text-prado-text-muted">{{ label }}</p>
        </div>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
      <h2 class="text-sm font-semibold text-prado-text mb-4">Activite recente</h2>
      <div v-if="activity.length === 0" class="text-sm text-prado-text-muted py-4 text-center">
        Aucune activite recente
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(item, idx) in activity"
          :key="idx"
          class="flex items-start gap-3"
        >
          <CircleDot :size="16" class="mt-0.5 flex-shrink-0" :style="{ color: activityColors[item.type] }" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-prado-text">
              <span class="font-medium">{{ item.label }}</span>
              <span class="text-prado-text-muted"> — {{ item.detail }}</span>
            </p>
          </div>
          <span class="text-xs text-prado-text-faint flex-shrink-0">
            {{ formatRelativeDate(item.date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
