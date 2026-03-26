<script setup lang="ts">
import { Users, ClipboardList, CalendarDays, UserPlus, BookOpen, Loader2, Calendar } from 'lucide-vue-next'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const { user, jeunes, inscriptions, loading } = useAuth()

const isPending = computed(() => user.value?.status === 'pending')
const isRejected = computed(() => user.value?.status === 'rejected')

// Stat cards
const jeunesCount = computed(() => jeunes.value.length)
const inscriptionsCount = computed(() => inscriptions.value.length)
const inscriptionsThisMonth = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return inscriptions.value.filter(i => new Date(i.date) >= startOfMonth).length
})

// Actions map for inscription display
const { data: actionsData } = await useAsyncData('espace-actions-map', () =>
  $fetch<{ id: number; title: string }[]>('/api/actions/map'),
)

const actionMap = computed(() => {
  const map = new Map<string, { id: number; title: string }>()
  for (const a of actionsData.value ?? []) {
    map.set(String(a.id), { id: a.id, title: a.title })
  }
  return map
})

// Latest 5 inscriptions
const latestInscriptions = computed(() => {
  return inscriptions.value.slice(0, 5).map(insc => {
    const jeune = jeunes.value.find(j => j.id === insc.jeuneId)
    const action = actionMap.value.get(insc.actionId)
    return {
      id: insc.id,
      jeuneName: jeune ? `${jeune.firstName} ${jeune.lastName}` : 'Jeune inconnu',
      actionTitle: action?.title ?? 'Action inconnue',
      actionId: action?.id,
      date: insc.date,
    }
  })
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else class="max-w-5xl mx-auto space-y-8">
    <h1 class="text-xl font-semibold text-prado-text italic">Tableau de bord</h1>

    <!-- Status banners -->
    <div v-if="isPending" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-sm text-amber-600">
      Votre compte est en attente de validation par l'association. Vous pourrez gerer vos fiches jeunes une fois votre compte approuve.
    </div>
    <div v-if="isRejected" class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-400">
      Votre demande de compte a ete refusee. Contactez l'association pour plus d'informations.
    </div>

    <!-- Onboarding checklist -->
    <OnboardingNextStep />

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-prado-surface rounded-2xl border border-prado-border p-5 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-[#004657]/15">
          <Users :size="20" class="text-[#004657]" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-prado-text">{{ jeunesCount }}</p>
          <p class="text-xs text-prado-text-muted">Jeunes</p>
        </div>
      </div>
      <div class="bg-prado-surface rounded-2xl border border-prado-border p-5 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-[#93C1AF]/20">
          <ClipboardList :size="20" class="text-[#93C1AF]" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-prado-text">{{ inscriptionsCount }}</p>
          <p class="text-xs text-prado-text-muted">Inscriptions actives</p>
        </div>
      </div>
      <div class="bg-prado-surface rounded-2xl border border-prado-border p-5 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-[#FB6223]/15">
          <CalendarDays :size="20" class="text-[#FB6223]" />
        </div>
        <div>
          <p class="text-2xl font-semibold text-prado-text">{{ inscriptionsThisMonth }}</p>
          <p class="text-xs text-prado-text-muted">Inscriptions ce mois</p>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/espace/jeunes?add=1"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004657] text-white text-sm hover:opacity-90 transition-opacity"
      >
        <UserPlus :size="16" />
        Ajouter un jeune
      </NuxtLink>
      <NuxtLink
        to="/actions"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#93C1AF] text-white text-sm hover:opacity-90 transition-opacity"
      >
        <BookOpen :size="16" />
        Parcourir les actions
      </NuxtLink>
    </div>

    <!-- Latest inscriptions -->
    <div class="bg-prado-surface rounded-2xl border border-prado-border p-6">
      <h2 class="text-sm font-semibold text-prado-text mb-4">Dernieres inscriptions</h2>
      <div v-if="latestInscriptions.length === 0" class="text-sm text-prado-text-muted py-4 text-center">
        Aucune inscription pour le moment.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="insc in latestInscriptions"
          :key="insc.id"
          class="flex items-center gap-3"
        >
          <Calendar :size="16" class="text-prado-text-faint flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-prado-text">
              <span class="font-medium">{{ insc.jeuneName }}</span>
              <span class="text-prado-text-muted"> — </span>
              <NuxtLink
                v-if="insc.actionId"
                :to="`/actions/${insc.actionId}`"
                class="text-[#004657] hover:underline"
              >
                {{ insc.actionTitle }}
              </NuxtLink>
              <span v-else class="text-prado-text-muted">{{ insc.actionTitle }}</span>
            </p>
          </div>
          <span class="text-xs text-prado-text-faint flex-shrink-0">
            {{ formatDate(insc.date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
