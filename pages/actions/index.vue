<script setup lang="ts">
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'
import type { DbAction, DbRessource } from '~/lib/api'
import {
  PROGRAMMATION_CATEGORIES,
  PROGRAMMATION_CATEGORY_COLORS,
  RESSOURCE_CATEGORIES,
  RESSOURCE_CATEGORY_COLORS,
  type ProgrammationCategory,
  type RessourceCategory,
} from '~/constants/categories'

type Panel = 'actions' | 'ressources'
type FilterMode = 'activite' | 'actions'

const client = useSupabaseClient()

const panel = ref<Panel>('actions')
const search = ref('')
const categoryFilter = ref<ProgrammationCategory | 'all'>('all')
const filterMode = ref<FilterMode>('activite')
const actionsPage = ref(1)
const searchRes = ref('')
const catRes = ref<RessourceCategory | 'all'>('all')
const resPage = ref(1)
const listRef = ref<HTMLDivElement | null>(null)

const ITEMS_PER_PAGE = 12
const RES_PER_PAGE = 12

const { data: dbActions, status: actionsStatus } = await useAsyncData('actions', async () => {
  const { data } = await client.from('actions').select('*').eq('is_published', true).order('id')
  return (data ?? []) as DbAction[]
})
const { data: dbRessources, status: ressourcesStatus } = await useAsyncData('ressources', async () => {
  const { data } = await client.from('ressources').select('*').eq('is_published', true).order('id')
  return (data ?? []) as DbRessource[]
})

const loadingData = computed(() => actionsStatus.value === 'pending' || ressourcesStatus.value === 'pending')

const programmation = computed(() =>
  (dbActions.value ?? []).map(row => ({
    id: row.id,
    title: row.title,
    category: row.category as ProgrammationCategory,
    date: row.date ?? '',
    time: row.time ?? '',
    summary: row.summary ?? '',
    description: row.description ?? '',
    urlDetail: row.url_detail ?? '',
    urlImage: row.url_image ?? '',
    isActivite: row.is_activite ?? false,
  }))
)

const ressources = computed(() =>
  (dbRessources.value ?? []).map(row => ({
    id: row.id,
    title: row.title,
    category: row.category as RessourceCategory,
    description: row.description ?? '',
    url: row.url ?? '',
    image: row.image ?? '',
  }))
)

const filteredActions = computed(() =>
  programmation.value.filter(a => {
    if (filterMode.value === 'activite' && !a.isActivite) return false
    if (filterMode.value === 'actions' && a.isActivite) return false
    if (categoryFilter.value !== 'all' && a.category !== categoryFilter.value) return false
    if (search.value && !a.title.toLowerCase().includes(search.value.toLowerCase()) && !a.description.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  })
)

const actionsTotalPages = computed(() => Math.ceil(filteredActions.value.length / ITEMS_PER_PAGE))
const paginatedActions = computed(() =>
  filteredActions.value.slice((actionsPage.value - 1) * ITEMS_PER_PAGE, actionsPage.value * ITEMS_PER_PAGE)
)

const filteredRes = computed(() =>
  ressources.value.filter(r => {
    if (catRes.value !== 'all' && r.category !== catRes.value) return false
    if (searchRes.value && !r.title.toLowerCase().includes(searchRes.value.toLowerCase()) && !r.description.toLowerCase().includes(searchRes.value.toLowerCase())) return false
    return true
  })
)

const resTotalPages = computed(() => Math.ceil(filteredRes.value.length / RES_PER_PAGE))
const paginatedRes = computed(() =>
  filteredRes.value.slice((resPage.value - 1) * RES_PER_PAGE, resPage.value * RES_PER_PAGE)
)

const visibleCategories = computed(() =>
  PROGRAMMATION_CATEGORIES.filter(cat =>
    programmation.value.some(a => {
      if (filterMode.value === 'activite' && !a.isActivite) return false
      if (filterMode.value === 'actions' && a.isActivite) return false
      return a.category === cat
    })
  )
)

function scrollToList() {
  listRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function switchPanel(p: Panel) {
  panel.value = p
  scrollToList()
}

function onSearchActions(val: string) {
  search.value = val
  actionsPage.value = 1
}

function onSearchRes(val: string) {
  searchRes.value = val
  resPage.value = 1
}

function toggleCategory(cat: ProgrammationCategory) {
  categoryFilter.value = categoryFilter.value === cat ? 'all' : cat
  actionsPage.value = 1
}

function toggleCatRes(cat: RessourceCategory) {
  catRes.value = catRes.value === cat ? 'all' : cat
  resPage.value = 1
}

function setFilterModeAndReset(mode: FilterMode) {
  filterMode.value = mode
  categoryFilter.value = 'all'
  actionsPage.value = 1
}

function goToPage(page: number, setter: (p: number) => void) {
  setter(page)
  scrollToList()
}

function paginationPages(currentPage: number, totalPages: number): (number | string)[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
    .reduce<(number | string)[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="py-20 md:py-28">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="text-prado-text-muted text-sm mb-5 tracking-wide">
          Programmation 2025-2026 | 11-25 ans
        </p>
        <h1
          class="text-4xl md:text-5xl lg:text-6xl text-prado-text mb-6"
          :style="{ fontFamily: 'Poppins', lineHeight: 1.15 }"
        >
          Jeunes &amp; Autonomes
        </h1>
        <p class="text-prado-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Des actions socio-educatives pour accompagner les jeunes vers l'autonomie : activites au calendrier, actions sur mesure et ressources pour les professionnels.
        </p>
        <button
          class="px-8 py-3.5 rounded-full border border-prado-border-medium text-prado-text hover:bg-prado-surface-hover transition-colors"
          @click="scrollToList"
        >
          Parcourir la programmation
        </button>
      </div>
    </div>

    <div class="h-px bg-prado-border-light" />

    <!-- Content -->
    <div ref="listRef" class="bg-prado-bg-deep min-h-screen">
      <div v-if="loadingData" class="flex items-center justify-center py-20">
        <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
      </div>
      <div v-else class="max-w-7xl mx-auto px-6 py-14">
        <!-- Tabs -->
        <div class="flex border-b border-prado-border-light w-full mb-8">
          <button
            :class="[
              'px-6 py-3 text-sm transition-colors relative',
              panel === 'actions' ? 'text-prado-text' : 'text-prado-text-muted hover:text-prado-text-secondary',
            ]"
            @click="switchPanel('actions')"
          >
            Actions
            <span v-if="panel === 'actions'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CF006C]" />
          </button>
          <button
            :class="[
              'px-6 py-3 text-sm transition-colors relative',
              panel === 'ressources' ? 'text-prado-text' : 'text-prado-text-muted hover:text-prado-text-secondary',
            ]"
            @click="switchPanel('ressources')"
          >
            Ressources
            <span v-if="panel === 'ressources'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CF006C]" />
          </button>
        </div>

        <!-- ACTIONS PANEL -->
        <div v-if="panel === 'actions'">
          <h2 class="text-3xl md:text-4xl text-prado-text mb-6" :style="{ fontFamily: 'Poppins' }">
            Notre programmation
          </h2>

          <div class="relative mb-8">
            <Search :size="20" class="absolute left-6 top-1/2 -translate-y-1/2 text-prado-text-faint" />
            <input
              :value="search"
              placeholder="Rechercher une action..."
              class="w-full pl-14 pr-6 py-5 rounded-2xl bg-prado-surface border border-prado-border-light text-prado-text text-base placeholder:text-prado-text-faint focus:outline-none focus:border-prado-border-medium shadow-lg"
              @input="onSearchActions(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="flex flex-wrap gap-3 mb-8 items-center">
            <div class="flex rounded-full overflow-hidden bg-prado-surface p-1">
              <button
                :class="[
                  'px-5 py-2 rounded-full text-sm transition-colors',
                  filterMode === 'activite' ? 'bg-[#CF006C] text-white' : 'text-prado-text-muted hover:text-prado-text',
                ]"
                @click="setFilterModeAndReset('activite')"
              >
                Activite
              </button>
              <button
                :class="[
                  'px-5 py-2 rounded-full text-sm transition-colors',
                  filterMode === 'actions' ? 'bg-[#CF006C] text-white' : 'text-prado-text-muted hover:text-prado-text',
                ]"
                @click="setFilterModeAndReset('actions')"
              >
                Actions
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in visibleCategories"
                :key="cat"
                :class="[
                  'px-4 py-2 rounded-full text-sm transition-colors border flex items-center gap-2',
                  categoryFilter === cat
                    ? 'text-prado-text border-prado-border-medium'
                    : 'text-prado-text-muted border-prado-border hover:text-prado-text-secondary hover:border-prado-border-light',
                ]"
                :style="categoryFilter === cat ? { backgroundColor: PROGRAMMATION_CATEGORY_COLORS[cat] + '30', borderColor: PROGRAMMATION_CATEGORY_COLORS[cat] + '50' } : {}"
                @click="toggleCategory(cat)"
              >
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: PROGRAMMATION_CATEGORY_COLORS[cat] }" />
                {{ cat }}
              </button>
            </div>

            <span class="text-sm text-prado-text-faint ml-2">{{ filteredActions.length }} action{{ filteredActions.length > 1 ? 's' : '' }}</span>
          </div>

          <div v-if="paginatedActions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="a in paginatedActions"
              :key="a.id"
              :to="`/actions/${a.id}`"
              class="group block rounded-2xl overflow-hidden bg-prado-surface hover:brightness-105 transition-all duration-300"
            >
              <div class="relative h-48 overflow-hidden bg-prado-surface">
                <ImageWithFallback :src="a.urlImage" :alt="a.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-prado-surface/60 to-transparent" />

                <div
                  v-if="a.isActivite"
                  class="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs text-white"
                  :style="{ backgroundColor: PROGRAMMATION_CATEGORY_COLORS[a.category] }"
                >
                  {{ a.date }}
                </div>
                <div
                  v-else
                  class="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs bg-prado-tag-bg backdrop-blur-sm text-prado-text"
                >
                  Toute l'annee
                </div>
              </div>

              <div class="p-5">
                <span class="text-xs mb-2 inline-block" :style="{ color: PROGRAMMATION_CATEGORY_COLORS[a.category] }">{{ a.category }}</span>
                <h3 class="text-prado-text mb-2 line-clamp-2 group-hover:text-[#93C1AF] transition-colors">{{ a.title }}</h3>
                <p class="text-sm text-prado-text-muted line-clamp-2 mb-3">{{ a.summary }}</p>
                <div v-if="a.time" class="text-xs text-prado-text-faint">{{ a.time }}</div>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-center py-20 text-prado-text-faint">
            <p>Aucune action ne correspond a vos criteres.</p>
          </div>

          <!-- Pagination -->
          <div v-if="actionsTotalPages > 1" class="flex items-center justify-center gap-2 mt-12">
            <button
              :disabled="actionsPage === 1"
              class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              @click="goToPage(actionsPage - 1, (p) => actionsPage = p)"
            >
              <ChevronLeft :size="20" />
            </button>
            <template v-for="(p, i) in paginationPages(actionsPage, actionsTotalPages)" :key="i">
              <span v-if="typeof p === 'string'" class="text-prado-text-faint px-1">...</span>
              <button
                v-else
                :class="[
                  'w-10 h-10 rounded-full text-sm transition-colors',
                  actionsPage === p ? 'bg-prado-tag-bg text-prado-text' : 'text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover',
                ]"
                @click="goToPage(p as number, (v) => actionsPage = v)"
              >
                {{ p }}
              </button>
            </template>
            <button
              :disabled="actionsPage === actionsTotalPages"
              class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              @click="goToPage(actionsPage + 1, (p) => actionsPage = p)"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
        </div>

        <!-- RESSOURCES PANEL -->
        <div v-if="panel === 'ressources'">
          <h2 class="text-3xl md:text-4xl text-prado-text mb-6" :style="{ fontFamily: 'Poppins' }">
            Ressources pour les referents
          </h2>

          <div class="relative mb-8">
            <Search :size="20" class="absolute left-6 top-1/2 -translate-y-1/2 text-prado-text-faint" />
            <input
              :value="searchRes"
              placeholder="Rechercher une ressource..."
              class="w-full pl-14 pr-6 py-5 rounded-2xl bg-prado-surface border border-prado-border-light text-prado-text text-base placeholder:text-prado-text-faint focus:outline-none focus:border-prado-border-medium shadow-lg"
              @input="onSearchRes(($event.target as HTMLInputElement).value)"
            />
          </div>

          <div class="flex flex-wrap gap-2 mb-8 items-center">
            <button
              v-for="c in RESSOURCE_CATEGORIES"
              :key="c"
              :class="[
                'px-4 py-2 rounded-full text-sm transition-colors border flex items-center gap-2',
                catRes === c
                  ? 'text-prado-text border-prado-border-medium'
                  : 'text-prado-text-muted border-prado-border hover:text-prado-text-secondary hover:border-prado-border-light',
              ]"
              :style="catRes === c ? { backgroundColor: RESSOURCE_CATEGORY_COLORS[c] + '30', borderColor: RESSOURCE_CATEGORY_COLORS[c] + '50' } : {}"
              @click="toggleCatRes(c)"
            >
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: RESSOURCE_CATEGORY_COLORS[c] }" />
              {{ c }}
            </button>
            <span class="text-sm text-prado-text-faint ml-2">{{ filteredRes.length }} ressource{{ filteredRes.length > 1 ? 's' : '' }}</span>
          </div>

          <div v-if="paginatedRes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="r in paginatedRes"
              :key="r.id"
              :to="`/ressources/${r.id}`"
              class="group block rounded-2xl overflow-hidden bg-prado-surface hover:brightness-105 transition-all duration-300"
            >
              <div class="relative h-44 overflow-hidden bg-prado-surface">
                <ImageWithFallback :src="r.image" :alt="r.title" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-5">
                <span class="text-xs mb-2 inline-block" :style="{ color: RESSOURCE_CATEGORY_COLORS[r.category] }">{{ r.category }}</span>
                <h3 class="text-prado-text mb-2 line-clamp-2 group-hover:text-[#93C1AF] transition-colors">{{ r.title }}</h3>
                <p class="text-sm text-prado-text-muted line-clamp-2">{{ r.description }}</p>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="text-center py-20 text-prado-text-faint">
            <p>Aucune ressource ne correspond a vos criteres.</p>
          </div>

          <!-- Pagination -->
          <div v-if="resTotalPages > 1" class="flex items-center justify-center gap-2 mt-12">
            <button
              :disabled="resPage === 1"
              class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              @click="goToPage(resPage - 1, (p) => resPage = p)"
            >
              <ChevronLeft :size="20" />
            </button>
            <template v-for="(p, i) in paginationPages(resPage, resTotalPages)" :key="i">
              <span v-if="typeof p === 'string'" class="text-prado-text-faint px-1">...</span>
              <button
                v-else
                :class="[
                  'w-10 h-10 rounded-full text-sm transition-colors',
                  resPage === p ? 'bg-prado-tag-bg text-prado-text' : 'text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover',
                ]"
                @click="goToPage(p as number, (v) => resPage = v)"
              >
                {{ p }}
              </button>
            </template>
            <button
              :disabled="resPage === resTotalPages"
              class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              @click="goToPage(resPage + 1, (p) => resPage = p)"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
