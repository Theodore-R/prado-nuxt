<script setup lang="ts">
import { ArrowLeft, Calendar, Clock, ExternalLink, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  PROGRAMMATION_CATEGORY_COLORS,
  type ProgrammationCategory,
} from '~/constants/categories'
import type { DbActionWithPlaces } from '~/lib/api'

const route = useRoute()
const { user, jeunes, inscriptions, inscrire, desinscrire } = useAuth()
const { complete: completeOnboarding } = useOnboarding()

const showInscription = ref(false)
const actionId = route.params.id as string

const { data: actionData, status } = await useAsyncData(`action-${actionId}`, () =>
  $fetch<DbActionWithPlaces>(`/api/actions/${actionId}`),
)

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

    <h1 class="text-3xl text-prado-text mb-4" :style="{ fontFamily: 'Poppins' }">{{ action.title }}</h1>
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
