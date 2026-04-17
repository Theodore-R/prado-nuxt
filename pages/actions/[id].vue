<script setup lang="ts">
import { ArrowLeft, Calendar, Clock, ExternalLink, Loader2, Share2, Link, Mail, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  PROGRAMMATION_CATEGORY_COLORS,
  type ProgrammationCategory,
} from '~/constants/categories'
import type { DbActionWithPlaces } from '~/lib/api'

const route = useRoute()
const { user, jeunes, inscriptions, inscrire, desinscrire } = useAuth()
const { complete: completeOnboarding } = usePradoOnboarding()
const { checkConflict } = useConflictCheck()
const { share, copyLink, shareByEmail, shareByWhatsApp, canNativeShare } = usePradoShare()
const showShareMenu = ref(false)

const showInscription = ref(false)
const actionId = route.params.id as string
const selectedDateId = ref<string | null>(null)

const { data: actionData, status } = await useAsyncData(`action-${actionId}`, () =>
  $fetch<DbActionWithPlaces>(`/api/actions/${actionId}`),
)

// Actions map for conflict detection (now with dates[])
const { data: actionsMapData } = await useAsyncData('conflict-actions-map-public', () =>
  $fetch<{ id: number; title: string; dates: { id: string; date: string; time: string }[] }[]>('/api/actions/map'),
)
const actionsMap = computed(() => {
  const map = new Map<string, { id: number; title: string; dates: { id: string; date: string }[] }>()
  for (const a of actionsMapData.value ?? []) map.set(String(a.id), a)
  return map
})

const loading = computed(() => status.value === 'pending')

const action = computed(() => {
  const a = actionData.value
  if (!a) return null
  return {
    id: a.id,
    title: a.title,
    category: a.category,
    date: a.date ?? '',
    time: a.time ?? '',
    summary: a.summary ?? '',
    description: a.description ?? '',
    url_detail: a.url_detail ?? '',
    url_image: a.url_image ?? '',
    is_activite: a.is_activite ?? false,
    placesMax: a.places_max,
    inscriptionsCount: a.inscriptionsCount,
    placesRemaining: a.placesRemaining,
    isFull: a.places_max !== null && a.inscriptionsCount >= a.places_max,
    dates: a.dates ?? [],
    isTermine: a.isTermine ?? false,
    nextDate: a.nextDate ?? null,
  }
})

const color = computed(() =>
  action.value
    ? PROGRAMMATION_CATEGORY_COLORS[action.value.category as ProgrammationCategory]
    : '#FB6223'
)

const actionInscriptions = computed(() =>
  inscriptions.value.filter(i => i.actionId === String(action.value?.id))
)

const todayKey = new Date().toISOString().slice(0, 10)

const availableDates = computed(() => {
  if (!action.value) return []
  return action.value.dates.filter(d => d.date >= todayKey)
})

watch(availableDates, (dates) => {
  if (dates.length === 1 && !selectedDateId.value) {
    selectedDateId.value = dates[0].id
  }
}, { immediate: true })

function formatDateLabel(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  }
  return dateStr
}

async function handleInscrire(jeuneId: string) {
  if (!action.value) return

  if (action.value.is_activite && availableDates.value.length > 0 && !selectedDateId.value) {
    toast.error('Selectionnez une date avant d\'inscrire')
    return
  }

  const already = inscriptions.value.find(
    i => i.actionId === String(action.value!.id) && i.jeuneId === jeuneId
  )
  if (already) {
    toast.error('Ce jeune est deja inscrit')
    return
  }
  const selectedDate = action.value.dates.find(d => d.id === selectedDateId.value)
  checkConflict(jeuneId, String(action.value.id), selectedDate?.date ?? null, actionsMap.value)
  try {
    await inscrire(String(action.value.id), selectedDateId.value, jeuneId)
    completeOnboarding('firstInscription')
    toast.success('Inscription confirmee !')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
  }
}

async function handleDesinscrire(inscriptionId: string) {
  try {
    await desinscrire(inscriptionId)
    toast.info('Inscription annulee')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur')
  }
}
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else-if="!action" class="max-w-7xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl text-prado-text">Action non trouvee</h1>
    <NuxtLink to="/actions" class="text-[var(--prado-signature-accent)] mt-4 inline-block">Retour a la programmation</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink to="/actions" class="inline-flex items-center gap-2 text-prado-text-muted hover:text-[var(--prado-signature-accent)] mb-8 transition-colors text-sm">
      <ArrowLeft :size="15" /> Retour a la programmation
    </NuxtLink>

    <div class="rounded-2xl overflow-hidden mb-8 bg-prado-surface">
      <PrImageWithFallback :src="action.url_image" :alt="action.title" class="w-full h-64 md:h-80 object-cover" />
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <span class="px-3 py-1 rounded-full text-xs text-white" :style="{ backgroundColor: color }">{{ action.category }}</span>
      <span v-if="!action.is_activite" class="px-3 py-1 rounded-full text-xs bg-prado-tag-bg text-prado-text">Toute l'annee</span>
      <span v-if="action.isTermine" class="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 font-medium">Termine</span>
    </div>

    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-3xl text-prado-text" :style="{ fontFamily: 'Poppins' }">{{ action.title }}</h1>
      <div class="relative flex-shrink-0">
        <button
          class="p-2.5 rounded-xl bg-prado-surface border border-prado-border hover:bg-prado-surface-hover transition-colors text-prado-text-muted"
          title="Partager"
          @click="canNativeShare ? share(action.title, action.summary || action.title, useRequestURL().href) : (showShareMenu = !showShareMenu)"
        >
          <Share2 :size="18" />
        </button>
        <div
          v-if="showShareMenu && !canNativeShare"
          class="absolute right-0 top-full mt-1.5 w-48 bg-prado-surface border border-prado-border rounded-xl shadow-lg z-20 py-1.5"
        >
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="copyLink(useRequestURL().href); showShareMenu = false">
            <Link :size="14" class="text-prado-text-faint" /> Copier le lien
          </button>
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByEmail(action.title, useRequestURL().href); showShareMenu = false">
            <Mail :size="14" class="text-prado-text-faint" /> Envoyer par email
          </button>
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByWhatsApp(action.title, useRequestURL().href); showShareMenu = false">
            <svg class="w-3.5 h-3.5 text-prado-text-faint" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.504 3.932 1.387 5.607L0 24l6.576-1.372A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.91 0-3.74-.53-5.328-1.527l-.383-.227-3.97.829.843-3.888-.25-.396A9.775 9.775 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z"/></svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
    <div class="text-prado-text-muted mb-8 leading-relaxed prose prose-sm max-w-none whitespace-pre-line">
      {{ action.description }}
    </div>

    <div class="bg-prado-surface rounded-2xl p-6 border border-prado-border space-y-3 mb-10">
      <h3 class="text-prado-text mb-1">Informations pratiques</h3>

      <!-- Multi-dates -->
      <template v-if="action.is_activite && action.dates.length > 0">
        <p class="text-xs text-prado-text-muted">{{ action.dates.length }} session{{ action.dates.length > 1 ? 's' : '' }}</p>
        <div class="space-y-2">
          <div
            v-for="d in action.dates"
            :key="d.id"
            class="flex items-center gap-3 p-3 rounded-lg border"
            :class="d.date < todayKey ? 'opacity-50 border-prado-border bg-prado-bg' : 'border-prado-border bg-prado-bg'"
          >
            <Calendar :size="14" class="text-[var(--prado-signature-accent)] shrink-0" />
            <div class="flex-1">
              <p class="text-sm text-prado-text">{{ formatDateLabel(d.date) }}</p>
              <p v-if="d.time" class="text-xs text-prado-text-muted">{{ d.time }}</p>
            </div>
            <span v-if="d.date < todayKey" class="text-[10px] px-2 py-0.5 rounded-full bg-prado-text-faint/10 text-prado-text-faint">Passe</span>
            <span v-else-if="d.placesMax !== null && d.inscriptionsCount >= d.placesMax" class="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Complet</span>
            <span v-else-if="d.placesMax !== null" class="text-[10px] text-prado-text-faint">{{ d.placesRemaining }} place{{ (d.placesRemaining ?? 0) > 1 ? 's' : '' }}</span>
          </div>
        </div>
      </template>

      <!-- Fallback single date -->
      <template v-else-if="action.is_activite">
        <div class="flex items-center gap-2.5 text-sm text-prado-text-muted">
          <Calendar :size="15" class="text-[var(--prado-signature-accent)] shrink-0" />
          <span>{{ action.date }}</span>
        </div>
        <div v-if="action.time" class="flex items-center gap-2.5 text-sm text-prado-text-muted">
          <Clock :size="15" class="text-[var(--prado-signature-accent)] shrink-0" />
          <span>{{ action.time }}</span>
        </div>
      </template>

      <!-- Sur mesure -->
      <template v-else>
        <div class="flex items-center gap-2.5 text-sm text-prado-text-muted">
          <Calendar :size="15" class="text-[var(--prado-signature-accent)] shrink-0" />
          <span>Toute l'annee - a organiser avec le prescripteur</span>
        </div>
      </template>

      <div v-if="action.url_detail" class="mt-3">
        <a
          :href="action.url_detail"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-[var(--prado-signature-accent)] hover:underline"
        >
          <ExternalLink :size="14" />
          Voir sur le site Prado Itineraires
        </a>
      </div>
    </div>

    <!-- Termine banner -->
    <div v-if="action.isTermine" class="rounded-2xl border-2 border-dashed border-red-400/30 py-6 px-6 text-center mb-10">
      <AlertCircle :size="24" class="text-red-400 mx-auto mb-2" />
      <p class="text-sm text-prado-text-secondary">Action terminee — les inscriptions sont fermees.</p>
    </div>

    <!-- Inscription section -->
    <div v-if="user && !action.isTermine" class="bg-prado-surface border border-prado-border rounded-2xl p-6">
      <h2 class="text-xl text-prado-text mb-4">Inscrire un jeune</h2>

      <template v-if="!action.is_activite">
        <p class="text-sm text-prado-text-muted">
          Action sur mesure.
          <NuxtLink to="/contact" class="text-[var(--prado-signature-accent)] underline">Contactez-nous</NuxtLink>
          pour programmer une session.
        </p>
      </template>
      <template v-else>
        <!-- Date selector for multi-date actions -->
        <div v-if="availableDates.length > 1" class="mb-4">
          <p class="text-sm text-prado-text-muted mb-2">Choisissez une date :</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="d in availableDates"
              :key="d.id"
              class="px-3 py-1.5 rounded-lg text-xs border transition-all"
              :class="selectedDateId === d.id
                ? 'border-[var(--prado-signature)] bg-[var(--prado-signature)]/10 text-[var(--prado-signature-accent)] font-medium'
                : 'border-prado-border text-prado-text-muted hover:border-[var(--prado-signature)]/40'"
              :disabled="d.placesMax !== null && d.inscriptionsCount >= d.placesMax"
              @click="selectedDateId = d.id"
            >
              {{ formatDateLabel(d.date) }}
              <span v-if="d.placesMax !== null && d.inscriptionsCount >= d.placesMax" class="ml-1 text-red-400">(complet)</span>
            </button>
          </div>
        </div>

        <div v-if="action.isFull" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-4">
          Cette action est complete.
        </div>
        <button
          v-if="!showInscription"
          class="px-6 py-2.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:bg-[var(--prado-signature)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="action.isFull || (availableDates.length > 0 && !selectedDateId)"
          @click="showInscription = true"
        >
          Inscrire un jeune
        </button>
        <div v-else class="space-y-3">
          <p class="text-sm text-prado-text-muted">Selectionnez un jeune :</p>
          <p v-if="jeunes.length === 0" class="text-sm text-prado-text-muted">
            Aucune fiche jeune.
            <NuxtLink to="/mon-compte" class="text-[var(--prado-signature-accent)] underline">Creer une fiche</NuxtLink>
          </p>
          <div v-else class="space-y-2">
            <div
              v-for="j in jeunes"
              :key="j.id"
              class="flex items-center justify-between p-3 rounded-xl bg-prado-input-bg"
            >
              <span class="text-sm text-prado-text">{{ j.firstName }} {{ j.lastName }}</span>
              <button
                v-if="inscriptions.find(i => i.actionId === String(action!.id) && i.jeuneId === j.id)"
                class="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
                @click="handleDesinscrire(inscriptions.find(i => i.actionId === String(action!.id) && i.jeuneId === j.id)!.id)"
              >
                Desinscrire
              </button>
              <button
                v-else
                class="text-xs px-3 py-1.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="action.isFull"
                @click="handleInscrire(j.id)"
              >
                Inscrire
              </button>
            </div>
          </div>
          <button class="text-sm text-prado-text-faint underline" @click="showInscription = false">Fermer</button>
        </div>
      </template>

      <div v-if="actionInscriptions.length > 0" class="mt-4 pt-4 border-t border-prado-border">
        <h4 class="text-sm text-prado-text-secondary mb-2">Inscrits ({{ actionInscriptions.length }})</h4>
        <template v-for="insc in actionInscriptions" :key="insc.id">
          <span
            v-if="jeunes.find(j => j.id === insc.jeuneId)"
            class="inline-block mr-2 mb-1 px-3 py-1 rounded-full text-xs bg-[var(--prado-signature)]/15 text-[var(--prado-signature-accent)]"
          >
            {{ jeunes.find(j => j.id === insc.jeuneId)!.firstName }} {{ jeunes.find(j => j.id === insc.jeuneId)!.lastName }}
          </span>
        </template>
      </div>
    </div>

    <div v-else class="bg-prado-surface border border-prado-border rounded-2xl p-8 text-center">
      <p class="text-prado-text-muted mb-4">Connectez-vous pour inscrire des jeunes.</p>
      <NuxtLink to="/connexion" class="px-6 py-2.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:bg-[var(--prado-signature)]/80 transition-colors">
        Se connecter
      </NuxtLink>
    </div>
  </div>
</template>
