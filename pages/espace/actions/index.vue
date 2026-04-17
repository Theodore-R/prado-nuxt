<script setup lang="ts">
import { Search, UserPlus, Calendar, MapPin, BookOpen } from 'lucide-vue-next'
import {
  PROGRAMMATION_CATEGORIES,
  PROGRAMMATION_CATEGORY_COLORS,
  type ProgrammationCategory,
} from '~/constants/categories'
import type { DbActionWithPlaces } from '~/lib/api'

definePageMeta({ layout: 'espace', middleware: 'auth' })

// Nudge contextuel : marquer "catalogue visité"
const { complete: completeOnboarding } = usePradoOnboarding()
onMounted(() => completeOnboarding('catalogVisited'))

type FilterMode = 'activite' | 'actions'

const { jeunes } = useAuth()

const search = ref('')
const categoryFilter = ref<ProgrammationCategory | 'all'>('all')
const filterMode = ref<FilterMode>('activite')
const visibleCount = ref(12)
const sentinelRef = ref<HTMLDivElement | null>(null)

const BATCH_SIZE = 12

const { data: dbActions, status } = await useAsyncData('espace-actions', () =>
  $fetch<DbActionWithPlaces[]>('/api/actions'),
)

const programmation = computed(() =>
  (dbActions.value ?? []).map(a => ({
    id: a.id,
    title: a.title,
    category: a.category as ProgrammationCategory,
    date: a.date ?? '',
    time: a.time ?? '',
    summary: a.summary ?? '',
    description: a.description ?? '',
    urlImage: a.url_image ?? '',
    isActivite: a.is_activite ?? false,
    placesMax: a.places_max,
    inscriptionsCount: a.inscriptionsCount,
    placesRemaining: a.placesRemaining,
    isFull: a.places_max !== null && a.inscriptionsCount >= a.places_max,
  })),
)

const filteredActions = computed(() =>
  programmation.value.filter(a => {
    if (filterMode.value === 'activite' && !a.isActivite) return false
    if (filterMode.value === 'actions' && a.isActivite) return false
    if (categoryFilter.value !== 'all' && a.category !== categoryFilter.value) return false
    if (search.value && !a.title.toLowerCase().includes(search.value.toLowerCase()) && !a.description.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

const visibleActions = computed(() =>
  filteredActions.value.slice(0, visibleCount.value),
)

const hasMore = computed(() => visibleCount.value < filteredActions.value.length)

const visibleCategories = computed(() =>
  PROGRAMMATION_CATEGORIES.filter(cat =>
    programmation.value.some(a => {
      if (filterMode.value === 'activite' && !a.isActivite) return false
      if (filterMode.value === 'actions' && a.isActivite) return false
      return a.category === cat
    }),
  ),
)

const hasJeunes = computed(() => jeunes.value.length > 0)

function onSearch(val: string) {
  search.value = val
  visibleCount.value = BATCH_SIZE
}

function toggleCategory(cat: ProgrammationCategory) {
  categoryFilter.value = categoryFilter.value === cat ? 'all' : cat
  visibleCount.value = BATCH_SIZE
}

function setFilterMode(mode: FilterMode) {
  filterMode.value = mode
  categoryFilter.value = 'all'
  visibleCount.value = BATCH_SIZE
}

function loadMore() {
  visibleCount.value += BATCH_SIZE
}

onMounted(() => {
  if (!sentinelRef.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value) {
        loadMore()
      }
    },
    { rootMargin: '200px' },
  )
  observer.observe(sentinelRef.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-prado-text">Actions</h1>
      <span class="text-sm text-prado-text-faint">{{ filteredActions.length }} action{{ filteredActions.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Info banner for prescripteurs without jeunes -->
    <div v-if="!hasJeunes" class="bg-prado-teal/10 border border-prado-teal/20 rounded-xl p-4 flex items-start gap-3">
      <UserPlus :size="18" class="text-prado-teal mt-0.5 shrink-0" />
      <div class="text-sm">
        <p class="text-prado-text font-medium mb-1">Ajoutez un jeune pour inscrire</p>
        <p class="text-prado-text-muted">Vous devez d'abord ajouter un jeune avant de pouvoir l'inscrire a une action.</p>
        <NuxtLink to="/espace/jeunes?add=1" class="inline-block mt-2 text-prado-teal hover:underline font-medium">
          Ajouter un jeune
        </NuxtLink>
      </div>
    </div>

    <!-- Search -->
    <div v-if="status !== 'pending'" class="relative">
      <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-prado-text-faint" />
      <input
        :value="search"
        placeholder="Rechercher une action..."
        class="w-full pl-11 pr-4 py-3 rounded-xl bg-prado-surface border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-prado-border-medium transition-colors"
        @input="onSearch(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Filters -->
    <div v-if="status !== 'pending'" class="flex flex-wrap gap-2 items-center">
      <button
        class="relative flex items-center w-[180px] h-9 rounded-full bg-prado-surface border border-prado-border cursor-pointer p-0.5"
        @click="setFilterMode(filterMode === 'activite' ? 'actions' : 'activite')"
      >
        <span
          class="absolute h-8 rounded-full bg-prado-sage transition-all duration-300 ease-in-out"
          :style="{
            width: '86px',
            left: filterMode === 'activite' ? '2px' : '92px',
          }"
        />
        <span
          :class="[
            'relative z-10 flex-1 text-center text-xs transition-colors duration-200',
            filterMode === 'activite' ? 'text-white' : 'text-prado-text-muted',
          ]"
        >
          Planifie
        </span>
        <span
          :class="[
            'relative z-10 flex-1 text-center text-xs transition-colors duration-200',
            filterMode === 'actions' ? 'text-white' : 'text-prado-text-muted',
          ]"
        >
          Sur mesure
        </span>
      </button>

      <button
        v-for="cat in visibleCategories"
        :key="cat"
        :class="[
          'px-3 py-1.5 rounded-full text-xs transition-all duration-200 border flex items-center gap-1.5',
          categoryFilter === cat
            ? 'text-prado-text border-prado-border-medium'
            : 'text-prado-text-muted border-prado-border hover:text-prado-text-secondary hover:border-prado-border-light',
        ]"
        :style="categoryFilter === cat ? { backgroundColor: PROGRAMMATION_CATEGORY_COLORS[cat] + '30', borderColor: PROGRAMMATION_CATEGORY_COLORS[cat] + '50' } : {}"
        @click="toggleCategory(cat)"
      >
        <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: PROGRAMMATION_CATEGORY_COLORS[cat] }" />
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="n in 4" :key="n" class="h-24 rounded-xl bg-prado-surface animate-pulse" />
    </div>

    <!-- Actions list (compact, dashboard style) -->
    <div v-else-if="visibleActions.length > 0" class="space-y-3">
      <NuxtLink
        v-for="a in visibleActions"
        :key="a.id"
        :to="`/espace/actions/${a.id}`"
        class="group flex items-center gap-4 p-4 rounded-xl bg-prado-surface border border-prado-border hover:border-prado-border-light transition-all"
      >
        <!-- Image -->
        <div class="w-20 h-16 rounded-lg overflow-hidden bg-prado-bg shrink-0">
          <PrImageWithFallback :src="a.urlImage" :alt="a.title" class="w-full h-full object-cover" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :style="{ backgroundColor: PROGRAMMATION_CATEGORY_COLORS[a.category] + '20', color: PROGRAMMATION_CATEGORY_COLORS[a.category] }">
              {{ a.category }}
            </span>
            <span v-if="a.isActivite && a.date" class="text-[10px] text-prado-text-faint flex items-center gap-1">
              <Calendar :size="10" /> {{ a.date }}
            </span>
            <span v-else-if="!a.isActivite" class="text-[10px] text-prado-text-faint">Sur mesure</span>
          </div>
          <h3 class="text-sm text-prado-text font-medium line-clamp-1 group-hover:text-[#93C1AF] transition-colors">{{ a.title }}</h3>
          <p class="text-xs text-prado-text-muted line-clamp-1 mt-0.5">{{ a.summary }}</p>
        </div>

        <!-- Places info -->
        <div class="shrink-0 text-right">
          <div
            v-if="a.placesRemaining !== null"
            class="text-xs font-medium px-2.5 py-1 rounded-full"
            :class="[
              a.isFull
                ? 'bg-red-500/15 text-red-400'
                : a.placesRemaining <= 3
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-[#93C1AF]/15 text-[#13332B]'
            ]"
          >
            <span v-if="a.isFull">Complet</span>
            <span v-else>{{ a.placesRemaining }} place{{ a.placesRemaining > 1 ? 's' : '' }}</span>
          </div>
          <div v-if="a.time" class="text-[10px] text-prado-text-faint mt-1">{{ a.time }}</div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="flex flex-col items-center py-20 text-center">
      <div class="w-14 h-14 rounded-full bg-prado-bg flex items-center justify-center mb-4">
        <BookOpen :size="24" class="text-prado-text-faint" />
      </div>
      <p class="text-sm text-prado-text-secondary mb-1">Aucune action trouvee</p>
      <p class="text-xs text-prado-text-muted max-w-xs">
        {{ search ? 'Essayez avec d\'autres mots-cles ou modifiez les filtres.' : 'Aucune action disponible dans cette categorie pour le moment.' }}
      </p>
      <button
        v-if="search || categoryFilter !== 'all'"
        class="mt-4 text-xs text-prado-sage hover:underline"
        @click="search = ''; categoryFilter = 'all'; visibleCount = BATCH_SIZE"
      >
        Reinitialiser les filtres
      </button>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinelRef">
      <div v-if="hasMore" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-prado-surface animate-pulse" />
      </div>
    </div>
  </div>
</template>
