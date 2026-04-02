<script setup lang="ts">
import { ArrowLeft, Calendar, Clock, ExternalLink, Loader2, UserPlus, Users, Plus, Check, Share2, Link, Mail } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  PROGRAMMATION_CATEGORY_COLORS,
  type ProgrammationCategory,
} from '~/constants/categories'
import type { DbActionWithPlaces } from '~/lib/api'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const route = useRoute()
const { user, jeunes, inscriptions, inscrire, desinscrire, addJeune } = useAuth()
const { complete: completeOnboarding } = useOnboarding()
const { checkConflict } = useConflictCheck()
const { share, copyLink, shareByEmail, shareByWhatsApp, canNativeShare } = useShare()
const showShareMenu = ref(false)

const showInscription = ref(false)
const showQuickAdd = ref(false)
const quickAddFirstName = ref('')
const quickAddLastName = ref('')
const quickAddLoading = ref(false)
const actionId = route.params.id as string

const { data: actionData, status } = await useAsyncData(`espace-action-${actionId}`, () =>
  $fetch<DbActionWithPlaces>(`/api/actions/${actionId}`),
)

// Actions map for conflict detection
const { data: actionsMapData } = await useAsyncData('conflict-actions-map', () =>
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
    : '#FB6223'
)

const actionUrl = computed(() => {
  const origin = import.meta.client ? globalThis.location?.origin : ''
  return `${origin}/actions/${actionId}`
})

const actionInscriptions = computed(() =>
  inscriptions.value.filter(i => i.actionId === String(action.value?.id))
)

const jeunesNotEnrolled = computed(() =>
  jeunes.value.filter(j =>
    !actionInscriptions.value.some(i => i.jeuneId === j.id)
  )
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
  checkConflict(jeuneId, String(action.value.id), action.value.date, actionsMap.value as any)
  try {
    await inscrire(String(action.value.id), null, jeuneId)
    completeOnboarding('firstInscription')
    toast.success('Inscription confirmee !')
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
  }
}

async function handleQuickAddJeune() {
  if (!quickAddFirstName.value.trim() || !quickAddLastName.value.trim()) return
  quickAddLoading.value = true
  try {
    await addJeune({
      firstName: quickAddFirstName.value.trim(),
      lastName: quickAddLastName.value.trim(),
      dateOfBirth: '',
      situation: '',
      notes: '',
      sex: '',
      isQpv: false,
      accompagnementType: [],
    })
    completeOnboarding('firstJeuneAdded')
    toast.success(`${quickAddFirstName.value} ${quickAddLastName.value} ajoute !`)
    quickAddFirstName.value = ''
    quickAddLastName.value = ''
    showQuickAdd.value = false
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout')
  } finally {
    quickAddLoading.value = false
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
  <div v-if="loading" class="flex items-center justify-center py-20">
    <Loader2 class="animate-spin text-prado-text-muted" :size="28" />
  </div>

  <div v-else-if="!action" class="max-w-3xl mx-auto py-16 text-center">
    <h1 class="text-xl text-prado-text mb-3">Action non trouvee</h1>
    <NuxtLink to="/espace/actions" class="text-[#FB6223] text-sm">Retour aux actions</NuxtLink>
  </div>

  <div v-else class="max-w-3xl mx-auto space-y-6">
    <NuxtLink to="/espace/actions" class="inline-flex items-center gap-1.5 text-prado-text-muted hover:text-prado-text text-sm transition-colors">
      <ArrowLeft :size="14" /> Retour aux actions
    </NuxtLink>

    <!-- Image -->
    <div class="rounded-xl overflow-hidden bg-prado-surface">
      <ImageWithFallback :src="action.url_image" :alt="action.title" class="w-full h-52 md:h-64 object-cover" />
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2">
      <span class="px-3 py-1 rounded-full text-xs text-white" :style="{ backgroundColor: color }">{{ action.category }}</span>
      <span v-if="!action.is_activite" class="px-3 py-1 rounded-full text-xs bg-prado-tag-bg text-prado-text">Toute l'annee</span>
    </div>

    <!-- Title & share -->
    <div class="flex items-start justify-between gap-3">
      <h1 class="text-2xl text-prado-text font-semibold">{{ action.title }}</h1>
      <div class="relative flex-shrink-0">
        <button
          class="p-2 rounded-xl bg-prado-surface border border-prado-border hover:bg-prado-surface-hover transition-colors text-prado-text-muted"
          title="Partager"
          @click="canNativeShare ? share(action.title, action.summary || action.title, `/actions/${action.id}`) : (showShareMenu = !showShareMenu)"
        >
          <Share2 :size="16" />
        </button>
        <div
          v-if="showShareMenu && !canNativeShare"
          class="absolute right-0 top-full mt-1.5 w-44 bg-prado-surface border border-prado-border rounded-xl shadow-lg z-20 py-1.5"
        >
          <button class="flex items-center gap-2 w-full px-3 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="copyLink(actionUrl); showShareMenu = false">
            <Link :size="13" class="text-prado-text-faint" /> Copier le lien
          </button>
          <button class="flex items-center gap-2 w-full px-3 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByEmail(action.title, actionUrl); showShareMenu = false">
            <Mail :size="13" class="text-prado-text-faint" /> Email
          </button>
          <button class="flex items-center gap-2 w-full px-3 py-2 text-sm text-prado-text hover:bg-prado-surface-hover transition-colors" @click="shareByWhatsApp(action.title, actionUrl); showShareMenu = false">
            <svg class="w-3.5 h-3.5 text-prado-text-faint" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.025.504 3.932 1.387 5.607L0 24l6.576-1.372A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.91 0-3.74-.53-5.328-1.527l-.383-.227-3.97.829.843-3.888-.25-.396A9.775 9.775 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z"/></svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
    <div class="text-prado-text-muted leading-relaxed text-sm whitespace-pre-line">
      {{ action.description }}
    </div>

    <!-- Practical info -->
    <div class="bg-prado-surface rounded-xl p-5 border border-prado-border space-y-3">
      <h3 class="text-sm font-medium text-prado-text">Informations pratiques</h3>
      <div class="flex items-center gap-2.5 text-sm text-prado-text-muted">
        <Calendar :size="14" class="text-[#FB6223] shrink-0" />
        <span>{{ action.is_activite ? action.date : "Toute l'annee - a organiser avec le prescripteur" }}</span>
      </div>
      <div v-if="action.time" class="flex items-center gap-2.5 text-sm text-prado-text-muted">
        <Clock :size="14" class="text-[#93C1AF] shrink-0" />
        <span>{{ action.time }}</span>
      </div>

      <!-- Places -->
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

      <a
        v-if="action.url_detail"
        :href="action.url_detail"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-xs text-[#FB6223] hover:underline mt-2"
      >
        <ExternalLink :size="12" />
        Voir sur le site Prado Itineraires
      </a>
    </div>

    <!-- ============================================ -->
    <!-- SECTION INSCRIPTION — tous cas de figure    -->
    <!-- ============================================ -->

    <!-- CAS: action sur mesure (pas d'inscription en ligne) -->
    <div
      v-if="!action.is_activite"
      class="rounded-xl border-2 border-dashed border-prado-border py-8 px-6 text-center"
    >
      <p class="text-sm text-prado-text-secondary mb-1">Action sur mesure</p>
      <p class="text-xs text-prado-text-muted">
        Les inscriptions se font en concertation avec l'equipe Prado.
        <NuxtLink to="/contact" class="text-[#FB6223] underline">Contactez-nous</NuxtLink>
        pour organiser une session.
      </p>
    </div>

    <!-- CAS: action complete, 0 inscrits -->
    <div
      v-else-if="action.isFull && actionInscriptions.length === 0"
      class="rounded-xl border-2 border-dashed border-prado-border py-8 px-6 text-center"
    >
      <div class="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
        <Users :size="18" class="text-red-400" />
      </div>
      <p class="text-sm text-prado-text-secondary mb-1">Action complete</p>
      <p class="text-xs text-prado-text-muted">Toutes les places sont prises pour cette action.</p>
    </div>

    <!-- CAS: 0 inscrits, 0 jeunes (empty state avec ajout rapide) -->
    <div
      v-else-if="actionInscriptions.length === 0 && jeunes.length === 0"
      class="rounded-xl border-2 border-dashed border-prado-border py-8 px-6"
    >
      <div class="text-center mb-5">
        <div class="w-11 h-11 rounded-full bg-prado-teal/10 flex items-center justify-center mx-auto mb-3">
          <UserPlus :size="18" class="text-prado-teal" />
        </div>
        <p class="text-sm text-prado-text-secondary mb-1">Creez votre premier jeune</p>
        <p class="text-xs text-prado-text-muted max-w-xs mx-auto">
          Ajoutez un jeune pour pouvoir l'inscrire a cette action.
        </p>
      </div>
      <form class="max-w-sm mx-auto space-y-3" @submit.prevent="handleQuickAddJeune">
        <div class="flex gap-2">
          <input
            v-model="quickAddFirstName"
            type="text"
            placeholder="Prenom"
            required
            class="flex-1 px-3 py-2.5 rounded-lg bg-prado-surface border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors"
          />
          <input
            v-model="quickAddLastName"
            type="text"
            placeholder="Nom"
            required
            class="flex-1 px-3 py-2.5 rounded-lg bg-prado-surface border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="quickAddLoading || !quickAddFirstName.trim() || !quickAddLastName.trim()"
          class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-prado-teal text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Loader2 v-if="quickAddLoading" :size="14" class="animate-spin" />
          <UserPlus v-else :size="14" />
          Ajouter et inscrire
        </button>
        <p class="text-[10px] text-prado-text-faint text-center">Vous pourrez completer la fiche plus tard.</p>
      </form>
    </div>

    <!-- CAS: 0 inscrits, des jeunes dispo (picker direct, pas de clic intermediaire) -->
    <div
      v-else-if="actionInscriptions.length === 0 && jeunesNotEnrolled.length > 0"
      class="bg-prado-surface border border-prado-border rounded-xl p-5 space-y-4"
    >
      <h2 class="text-sm font-medium text-prado-text">Inscrire un jeune</h2>
      <div class="space-y-2">
        <button
          v-for="j in jeunesNotEnrolled"
          :key="j.id"
          class="flex items-center justify-between w-full p-3 rounded-lg bg-prado-bg hover:bg-prado-surface-hover transition-colors text-left"
          @click="handleInscrire(j.id)"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-prado-teal/10 flex items-center justify-center text-[11px] font-medium text-prado-teal">
              {{ j.firstName[0] }}{{ j.lastName[0] }}
            </div>
            <span class="text-sm text-prado-text">{{ j.firstName }} {{ j.lastName }}</span>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-[#FB6223]/10 text-[#FB6223] font-medium">Inscrire</span>
        </button>
      </div>
      <!-- Ajout rapide inline -->
      <div class="border-t border-prado-border pt-3">
        <button
          v-if="!showQuickAdd"
          class="inline-flex items-center gap-1.5 text-xs text-prado-text-muted hover:text-prado-teal transition-colors"
          @click="showQuickAdd = true"
        >
          <Plus :size="12" /> Nouveau jeune
        </button>
        <form v-else class="space-y-2" @submit.prevent="handleQuickAddJeune">
          <div class="flex gap-2">
            <input v-model="quickAddFirstName" type="text" placeholder="Prenom" required class="flex-1 px-3 py-2 rounded-lg bg-prado-bg border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors" />
            <input v-model="quickAddLastName" type="text" placeholder="Nom" required class="flex-1 px-3 py-2 rounded-lg bg-prado-bg border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors" />
            <button
              type="submit"
              :disabled="quickAddLoading || !quickAddFirstName.trim() || !quickAddLastName.trim()"
              class="px-3 py-2 rounded-lg bg-prado-teal text-white text-xs hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
            >
              <Loader2 v-if="quickAddLoading" :size="14" class="animate-spin" />
              <Plus v-else :size="14" />
            </button>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-prado-text-faint">Fiche completable plus tard.</p>
            <button type="button" class="text-[10px] text-prado-text-faint hover:text-prado-text" @click="showQuickAdd = false; quickAddFirstName = ''; quickAddLastName = ''">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- CAS: des inscrits (card avec liste + ajout optionnel) -->
    <div
      v-else-if="actionInscriptions.length > 0"
      class="bg-prado-surface border border-prado-border rounded-xl p-5 space-y-4"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-medium text-prado-text">
          Jeunes inscrits
          <span class="text-prado-text-faint font-normal">({{ actionInscriptions.length }})</span>
        </h2>
        <button
          v-if="!action.isFull && jeunesNotEnrolled.length > 0 && !showInscription"
          class="inline-flex items-center gap-1 text-xs text-[#FB6223] hover:text-[#a80057] transition-colors"
          @click="showInscription = true"
        >
          <Plus :size="12" /> Ajouter
        </button>
        <span
          v-else-if="action.isFull"
          class="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400"
        >Complet</span>
      </div>

      <!-- Liste des inscrits -->
      <div class="space-y-2">
        <div
          v-for="insc in actionInscriptions"
          :key="insc.id"
          class="flex items-center justify-between p-3 rounded-lg bg-prado-bg"
        >
          <NuxtLink
            v-if="jeunes.find(j => j.id === insc.jeuneId)"
            :to="`/espace/jeunes/${insc.jeuneId}`"
            class="flex items-center gap-2.5 text-sm text-prado-text hover:text-[#93C1AF] transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-[#93C1AF]/15 flex items-center justify-center text-[11px] font-medium text-[#93C1AF]">
              {{ jeunes.find(j => j.id === insc.jeuneId)!.firstName[0] }}{{ jeunes.find(j => j.id === insc.jeuneId)!.lastName[0] }}
            </div>
            <div>
              <span class="block">{{ jeunes.find(j => j.id === insc.jeuneId)!.firstName }} {{ jeunes.find(j => j.id === insc.jeuneId)!.lastName }}</span>
              <span class="block text-[10px] text-prado-text-faint">Voir la fiche</span>
            </div>
          </NuxtLink>
          <span v-else class="text-sm text-prado-text-muted">Jeune inconnu</span>
          <button
            class="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            @click="handleDesinscrire(insc.id)"
          >
            Retirer
          </button>
        </div>
      </div>

      <!-- Picker inline (s'ouvre sous la liste) -->
      <template v-if="showInscription">
        <div class="border-t border-prado-border pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-prado-text-secondary">Ajouter un jeune</p>
            <button class="text-[10px] text-prado-text-faint hover:text-prado-text transition-colors" @click="showInscription = false">Fermer</button>
          </div>

          <!-- Jeunes non inscrits -->
          <div v-if="jeunesNotEnrolled.length > 0" class="space-y-2">
            <button
              v-for="j in jeunesNotEnrolled"
              :key="j.id"
              class="flex items-center justify-between w-full p-3 rounded-lg bg-prado-bg hover:bg-prado-surface-hover transition-colors text-left"
              @click="handleInscrire(j.id)"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-prado-teal/10 flex items-center justify-center text-[11px] font-medium text-prado-teal">
                  {{ j.firstName[0] }}{{ j.lastName[0] }}
                </div>
                <span class="text-sm text-prado-text">{{ j.firstName }} {{ j.lastName }}</span>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-[#FB6223]/10 text-[#FB6223] font-medium">Inscrire</span>
            </button>
          </div>

          <!-- Tous deja inscrits -->
          <div v-else class="flex items-center gap-2 py-2 text-xs text-prado-text-muted">
            <Check :size="14" class="text-[#93C1AF]" />
            Tous vos jeunes sont inscrits a cette action.
          </div>

          <!-- Ajout rapide -->
          <div class="border-t border-prado-border-light pt-3">
            <button
              v-if="!showQuickAdd"
              class="inline-flex items-center gap-1.5 text-xs text-prado-text-muted hover:text-prado-teal transition-colors"
              @click="showQuickAdd = true"
            >
              <Plus :size="12" /> Nouveau jeune
            </button>
            <form v-else class="space-y-2" @submit.prevent="handleQuickAddJeune">
              <div class="flex gap-2">
                <input v-model="quickAddFirstName" type="text" placeholder="Prenom" required class="flex-1 px-3 py-2 rounded-lg bg-prado-bg border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors" />
                <input v-model="quickAddLastName" type="text" placeholder="Nom" required class="flex-1 px-3 py-2 rounded-lg bg-prado-bg border border-prado-border text-sm text-prado-text placeholder:text-prado-text-faint focus:outline-none focus:border-prado-teal/40 transition-colors" />
                <button
                  type="submit"
                  :disabled="quickAddLoading || !quickAddFirstName.trim() || !quickAddLastName.trim()"
                  class="px-3 py-2 rounded-lg bg-prado-teal text-white text-xs hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                >
                  <Loader2 v-if="quickAddLoading" :size="14" class="animate-spin" />
                  <Plus v-else :size="14" />
                </button>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-[10px] text-prado-text-faint">Fiche completable plus tard.</p>
                <button type="button" class="text-[10px] text-prado-text-faint hover:text-prado-text" @click="showQuickAdd = false; quickAddFirstName = ''; quickAddLastName = ''">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      </template>

      <!-- Indication "tous inscrits" quand picker ferme -->
      <p
        v-else-if="!action.isFull && jeunesNotEnrolled.length === 0 && jeunes.length > 0"
        class="flex items-center gap-1.5 text-xs text-prado-text-muted pt-1"
      >
        <Check :size="12" class="text-[#93C1AF]" /> Tous vos jeunes sont inscrits
      </p>
    </div>
  </div>
</template>
