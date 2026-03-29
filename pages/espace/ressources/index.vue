<script setup lang="ts">
import { Search, FileText } from 'lucide-vue-next'
import * as prismicClient from '@prismicio/client'
import {
  RESSOURCE_CATEGORIES,
  RESSOURCE_CATEGORY_COLORS,
  type RessourceCategory,
} from '~/constants/categories'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const { getRessourceImage } = useImages()

const search = ref('')
const catFilter = ref<RessourceCategory | 'all'>('all')
const visibleCount = ref(12)
const sentinelRef = ref<HTMLDivElement | null>(null)

const BATCH_SIZE = 12

const { data: prismicRessources, status } = await useAsyncData('espace-ressources', async () => {
  const client = prismicClient.createClient('prado-nuxt')
  const res = await client.getByType('ressource', { pageSize: 100 })
  let allResults = [...res.results]
  let nextPage = res.next_page
  while (nextPage) {
    const next = await (await fetch(nextPage)).json()
    allResults = [...allResults, ...next.results]
    nextPage = next.next_page
  }
  return allResults
})

const ressources = computed(() =>
  (prismicRessources.value ?? [])
    .filter(doc => (doc.data.title as string)?.trim())
    .map(doc => ({
      id: doc.uid ?? doc.id,
      title: doc.data.title as string,
      category: doc.data.category as RessourceCategory,
      description: doc.data.description?.[0]?.text ?? '',
      url: doc.data.url?.url ?? '',
      image: doc.data.image?.url ?? getRessourceImage(doc.data.original_id as number),
    })),
)

const filteredRes = computed(() =>
  ressources.value.filter(r => {
    if (catFilter.value !== 'all' && r.category !== catFilter.value) return false
    if (search.value && !r.title.toLowerCase().includes(search.value.toLowerCase()) && !r.description.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

const visibleRes = computed(() =>
  filteredRes.value.slice(0, visibleCount.value),
)

const hasMore = computed(() => visibleCount.value < filteredRes.value.length)

function onSearch(val: string) {
  search.value = val
  visibleCount.value = BATCH_SIZE
}

function toggleCategory(cat: RessourceCategory) {
  catFilter.value = catFilter.value === cat ? 'all' : cat
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
      <h1 class="text-xl font-semibold text-prado-text">Ressources</h1>
      <span class="text-sm text-prado-text-faint">{{ filteredRes.length }} ressource{{ filteredRes.length > 1 ? 's' : '' }}</span>
    </div>

    <p class="text-sm text-prado-text-muted">
      Guides pratiques, fiches dispositifs et outils pedagogiques pour accompagner les jeunes.
    </p>

    <!-- Search -->
    <div v-if="status !== 'pending'" class="relative">
      <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-prado-text-faint" />
      <input
        :value="search"
        placeholder="Rechercher une ressource..."
        class="w-full pl-11 pr-4 py-3 rounded-xl bg-prado-surface border border-prado-border text-prado-text text-sm placeholder:text-prado-text-faint focus:outline-none focus:border-prado-border-medium transition-colors"
        @input="onSearch(($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Category filters -->
    <div v-if="status !== 'pending'" class="flex flex-wrap gap-2 items-center">
      <button
        v-for="c in RESSOURCE_CATEGORIES"
        :key="c"
        :class="[
          'px-3 py-1.5 rounded-full text-xs transition-all duration-200 border flex items-center gap-1.5',
          catFilter === c
            ? 'text-prado-text border-prado-border-medium'
            : 'text-prado-text-muted border-prado-border hover:text-prado-text-secondary hover:border-prado-border-light',
        ]"
        :style="catFilter === c ? { backgroundColor: RESSOURCE_CATEGORY_COLORS[c] + '30', borderColor: RESSOURCE_CATEGORY_COLORS[c] + '50' } : {}"
        @click="toggleCategory(c)"
      >
        <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: RESSOURCE_CATEGORY_COLORS[c] }" />
        {{ c }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-4">
      <div v-for="n in 4" :key="n" class="h-20 rounded-xl bg-prado-surface animate-pulse" />
    </div>

    <!-- Resources list (compact, dashboard style) -->
    <div v-else-if="visibleRes.length > 0" class="space-y-3">
      <NuxtLink
        v-for="r in visibleRes"
        :key="r.id"
        :to="`/espace/ressources/${r.id}`"
        class="group flex items-center gap-4 p-4 rounded-xl bg-prado-surface border border-prado-border hover:border-prado-border-light transition-all"
      >
        <!-- Image -->
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-prado-bg shrink-0 flex items-center justify-center">
          <ImageWithFallback :src="r.image" :alt="r.title" class="w-full h-full object-contain p-1" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full" :style="{ backgroundColor: RESSOURCE_CATEGORY_COLORS[r.category] + '20', color: RESSOURCE_CATEGORY_COLORS[r.category] }">
              {{ r.category }}
            </span>
          </div>
          <h3 class="text-sm text-prado-text font-medium line-clamp-1 group-hover:text-[var(--prado-signature-accent)] transition-colors">{{ r.title }}</h3>
          <p class="text-xs text-prado-text-muted line-clamp-1 mt-0.5">{{ r.description }}</p>
        </div>

      </NuxtLink>
    </div>

    <div v-else class="flex flex-col items-center py-20 text-center">
      <div class="w-14 h-14 rounded-full bg-prado-bg flex items-center justify-center mb-4">
        <FileText :size="24" class="text-prado-text-faint" />
      </div>
      <p class="text-sm text-prado-text-secondary mb-1">Aucune ressource trouvee</p>
      <p class="text-xs text-prado-text-muted max-w-xs">
        {{ search ? 'Essayez avec d\'autres mots-cles ou modifiez les filtres.' : 'Aucune ressource disponible dans cette categorie pour le moment.' }}
      </p>
      <button
        v-if="search || catFilter !== 'all'"
        class="mt-4 text-xs text-[var(--prado-signature-accent)] hover:underline"
        @click="search = ''; catFilter = 'all'; visibleCount = BATCH_SIZE"
      >
        Reinitialiser les filtres
      </button>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinelRef">
      <div v-if="hasMore" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-20 rounded-xl bg-prado-surface animate-pulse" />
      </div>
    </div>
  </div>
</template>
