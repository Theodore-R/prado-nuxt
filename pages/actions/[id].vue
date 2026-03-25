<script setup lang="ts">
import { ArrowLeft, Calendar, Clock, ExternalLink, Loader2, Share2, Link, Mail } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  PROGRAMMATION_CATEGORY_COLORS,
  type ProgrammationCategory,
} from '~/constants/categories'
import type { DbActionWithPlaces } from '~/lib/api'

const route = useRoute()
const { user, jeunes, inscriptions, inscrire, desinscrire } = useAuth()
const { complete: completeOnboarding } = useOnboarding()
const { checkConflict } = useConflictCheck()
const { share, copyLink, shareByEmail, shareByWhatsApp, canNativeShare } = useShare()
const showShareMenu = ref(false)

const showInscription = ref(false)
const actionId = route.params.id as string

const { data: actionData, status } = await useAsyncData(`action-${actionId}`, () =>
  $fetch<DbActionWithPlaces>(`/api/actions/${actionId}`),
)

// Actions map for conflict detection
const { data: actionsMapData } = await useAsyncData('conflict-actions-map-public', () =>
  $fetch<{ id: number; title: string; date: string | null }[]>('/api/actions/map'),
)
const actionsMap = computed(() => {
  const map = new Map<string, { id: number; title: string; date: string | null }>()
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
  }
})

const color = computed(() =>
  action.value
    ? PROGRAMMATION_CATEGORY_COLORS[action.value.category as ProgrammationCategory]
    : '#CF006C'
)

const actionInscriptions = computed(() =>
  inscriptions.value.filter(i => i.actionId === String(action.value?.id))
)

async function handleInscrire(jeuneId: string) {
  if (!action.value) return
  const already = inscriptions.value.find(
    i => i.actionId === String(action.value!.id) && i.jeuneId === jeuneId
  )
  if (already) {
    toast.error('Ce jeune est deja inscrit')
    return
  }
  // Conflict check (warning only, does not block)
  checkConflict(jeuneId, String(action.value.id), action.value.date, actionsMap.value)
  try {
    await inscrire(String(action.value.id), jeuneId)
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
    <NuxtLink to="/actions" class="text-[#FB6223] mt-4 inline-block">Retour a la programmation</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink to="/actions" class="inline-flex items-center gap-2 text-prado-text-muted hover:text-[#FB6223] mb-8 transition-colors text-sm">
      <ArrowLeft :size="15" /> Retour a la programmation
    </NuxtLink>

    <div class="rounded-2xl overflow-hidden mb-8 bg-prado-surface">
      <ImageWithFallback :src="action.url_image" :alt="action.title" class="w-full h-64 md:h-80 object-cover" />
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <span class="px-3 py-1 rounded-full text-xs text-white" :style="{ backgroundColor: color }">{{ action.category }}</span>
      <span v-if="!action.is_activite" class="px-3 py-1 rounded-full text-xs bg-prado-tag-bg text-prado-text">Toute l'annee</span>
    </div>

    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-3xl text-prado-text" :style="{ fontFamily: 'Poppins' }">{{ action.title }}</h1>
      <div class="relative flex-shrink-0">
        <button
          class="p-2.5 rounded-xl bg-prado-surface border border-prado-border hover:bg-prado-surface-hover transition-colors text-prado-text-muted"
          title="Partager"
          @click="canNativeShare ? share(action.title, action.summary || action.title, window.location.href) : (showShareMenu = !showShareMenu)"
        >
          <Share2 :size="18" />
        </button>
        <div
          v-if="showShareMenu && !canNativeShare"
          class="absolute right-0 top-full mt-1.5 w-48 bg-prado-surface border border-prado-border rounded-xl shadow-lg z-20 py-1.5"
        >
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="copyLink(window.location.href); showShareMenu = false">
            <Link :size="14" class="text-prado-text-faint" /> Copier le lien
          </button>
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByEmail(action.title, window.location.href); showShareMenu = false">
            <Mail :size="14" class="text-prado-text-faint" /> Envoyer par email
          </button>
          <button class="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByWhatsApp(action.title, window.location.href); showShareMenu = false">
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
      <div class="flex items-center gap-2.5 text-sm text-prado-text-muted">
        <Calendar :size="15" class="text-[#FB6223] shrink-0" />
        <span>{{ action.is_activite ? action.date : "Toute l'annee - a organiser avec le prescripteur" }}</span>
      </div>
      <div v-if="action.time" class="flex items-center gap-2.5 text-sm text-prado-text-muted">
        <Clock :size="15" class="text-[#93C1AF] shrink-0" />
        <span>{{ action.time }}</span>
      </div>

      <!-- Places status -->
      <div v-if="action.placesMax !== null" class="pt-3 border-t border-prado-border-light mt-3">
        <div class="flex items-center justify-between text-sm mb-1.5">
          <span :class="action.isFull ? 'text-red-400 font-medium' : 'text-prado-text-secondary'">
            {{ action.isFull ? 'Complet' : `${action.placesRemaining} places restantes sur ${action.placesMax}` }}
          </span>
        </div>
        <div class="h-1.5 w-full bg-prado-bg rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="action.isFull ? 'bg-red-500' : (action.placesRemaining! <= 3 ? 'bg-[#FB6223]' : 'bg-[#93C1AF]')"
            :style="{ width: `${action.placesMax > 0 ? Math.min(100, (action.inscriptionsCount / action.placesMax) * 100) : 0}%` }"
          />
        </div>
      </div>

      <div class="mt-3">
        <a
          :href="action.url_detail"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-[#FB6223] hover:underline"
        >
          <ExternalLink :size="14" />
          Voir sur le site Prado Itineraires
        </a>
      </div>
    </div>

    <!-- Inscription section -->
    <div v-if="user" class="bg-prado-surface border border-prado-border rounded-2xl p-6">
      <h2 class="text-xl text-prado-text mb-4">Inscrire un jeune</h2>

      <template v-if="!action.is_activite">
        <p class="text-sm text-prado-text-muted">
          Action sur mesure.
          <NuxtLink to="/contact" class="text-[#FB6223] underline">Contactez-nous</NuxtLink>
          pour programmer une session.
        </p>
      </template>
      <template v-else>
        <div v-if="action.isFull" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-4">
          Cette action est complete.
        </div>
        <button
          v-if="!showInscription"
          class="px-6 py-2.5 rounded-full bg-[#CF006C] text-white text-sm hover:bg-[#a80057] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="action.isFull"
          @click="showInscription = true"
        >
          Inscrire un jeune
        </button>
        <div v-else class="space-y-3">
          <p class="text-sm text-prado-text-muted">Selectionnez un jeune :</p>
          <p v-if="jeunes.length === 0" class="text-sm text-prado-text-muted">
            Aucune fiche jeune.
            <NuxtLink to="/mon-compte" class="text-[#FB6223] underline">Creer une fiche</NuxtLink>
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
                class="text-xs px-3 py-1.5 rounded-full bg-[#CF006C] text-white hover:bg-[#a80057] disabled:opacity-50 disabled:cursor-not-allowed"
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
            class="inline-block mr-2 mb-1 px-3 py-1 rounded-full text-xs bg-[#93C1AF]/15 text-[#93C1AF]"
          >
            {{ jeunes.find(j => j.id === insc.jeuneId)!.firstName }} {{ jeunes.find(j => j.id === insc.jeuneId)!.lastName }}
          </span>
        </template>
      </div>
    </div>

    <div v-else class="bg-prado-surface border border-prado-border rounded-2xl p-8 text-center">
      <p class="text-prado-text-muted mb-4">Connectez-vous pour inscrire des jeunes.</p>
      <NuxtLink to="/connexion" class="px-6 py-2.5 rounded-full bg-[#CF006C] text-white text-sm hover:bg-[#a80057] transition-colors">
        Se connecter
      </NuxtLink>
    </div>
  </div>
</template>
