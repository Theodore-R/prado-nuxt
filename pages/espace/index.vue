<script setup lang="ts">
import { Users, ClipboardList, CalendarDays, Loader2, Calendar, ShieldCheck, UserPlus, FileText, ArrowRight } from 'lucide-vue-next'

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

// Contextual action cards
const actionCards = computed(() => {
  const cards: { icon: typeof ShieldCheck; color: string; bgColor: string; title: string; description: string; link: string }[] = []

  // No jeunes yet → suggest adding one
  if (jeunes.value.length === 0) {
    cards.push({
      icon: UserPlus,
      color: '#004657',
      bgColor: '#004657',
      title: 'Créer votre première fiche jeune',
      description: 'Commencez par enregistrer un jeune pour accéder à toutes les fonctionnalités.',
      link: '/espace/jeunes?add=1',
    })
  }

  // Jeunes without identity verification
  for (const j of jeunes.value.filter(j => !j.identityVerified)) {
    cards.push({
      icon: ShieldCheck,
      color: '#004657',
      bgColor: '#004657',
      title: `Vérifier l'identité de ${j.firstName}`,
      description: 'En présence du jeune, lancez la vérification avec une pièce d\'identité valide.',
      link: `/espace/jeunes/${j.id}`,
    })
  }

  // Jeunes without inscriptions → suggest enrolling
  const jeuneIds = new Set(inscriptions.value.map(i => i.jeuneId))
  for (const j of jeunes.value.filter(j => !jeuneIds.has(j.id))) {
    cards.push({
      icon: ClipboardList,
      color: '#93C1AF',
      bgColor: '#93C1AF',
      title: `Inscrire ${j.firstName} à une action`,
      description: 'Ce jeune n\'est inscrit à aucune action. Parcourez le catalogue pour l\'inscrire.',
      link: `/espace/jeunes/${j.id}`,
    })
  }

  // Jeunes with incomplete health records
  // (show max 2 of this type to avoid flooding)
  let healthCount = 0
  for (const j of jeunes.value) {
    if (healthCount >= 2) break
    cards.push({
      icon: FileText,
      color: '#FB6223',
      bgColor: '#FB6223',
      title: `Compléter la fiche santé de ${j.firstName}`,
      description: 'Renseignez les informations de santé et la situation familiale.',
      link: `/espace/jeunes/${j.id}`,
    })
    healthCount++
  }

  return cards.slice(0, 4) // Max 4 action cards
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

    <!-- Contextual action cards -->
    <div v-if="actionCards.length > 0" class="space-y-3">
      <NuxtLink
        v-for="(card, i) in actionCards"
        :key="i"
        :to="card.link"
        class="block rounded-2xl p-5 border transition-opacity hover:opacity-90"
        :style="{ backgroundColor: card.bgColor + '10', borderColor: card.bgColor + '20' }"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :style="{ backgroundColor: card.bgColor + '15' }"
          >
            <component :is="card.icon" :size="20" :style="{ color: card.color }" />
          </div>
          <div class="flex-1">
            <p class="text-prado-text font-medium mb-0.5">{{ card.title }}</p>
            <p class="text-sm text-prado-text-secondary">{{ card.description }}</p>
          </div>
          <ArrowRight :size="16" class="text-prado-text-faint shrink-0 mt-2.5" />
        </div>
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
