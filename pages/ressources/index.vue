<script setup lang="ts">
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'
import * as prismicClient from '@prismicio/client'
import {
  RESSOURCE_CATEGORIES,
  RESSOURCE_CATEGORY_COLORS,
  type RessourceCategory,
} from '~/constants/categories'

const { getRessourceImage } = useImages()

const searchRes = ref('')
const catRes = ref<RessourceCategory | 'all'>('all')
const resPage = ref(1)
const listRef = ref<HTMLDivElement | null>(null)
const resAnimKey = ref(0)

const RES_PER_PAGE = 12

const { data: prismicRessources, status } = await useAsyncData('ressources-page', async () => {
  const client = prismicClient.createClient('prado-nuxt')
  const res = await client.getByType('ressource', { pageSize: 100 })
  // Fetch all pages
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
      id: doc.data.original_id as number ?? doc.id,
      title: doc.data.title as string,
      category: doc.data.category as RessourceCategory,
      description: doc.data.description?.[0]?.text ?? '',
      url: doc.data.url?.url ?? '',
      image: getRessourceImage(doc.data.original_id as number),
    })),
)

const filteredRes = computed(() =>
  ressources.value.filter(r => {
    if (catRes.value !== 'all' && r.category !== catRes.value) return false
    if (searchRes.value && !r.title.toLowerCase().includes(searchRes.value.toLowerCase()) && !r.description.toLowerCase().includes(searchRes.value.toLowerCase())) return false
    return true
  }),
)

const resTotalPages = computed(() => Math.ceil(filteredRes.value.length / RES_PER_PAGE))
const paginatedRes = computed(() =>
  filteredRes.value.slice((resPage.value - 1) * RES_PER_PAGE, resPage.value * RES_PER_PAGE),
)

function scrollToList() {
  listRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function onSearchRes(val: string) {
  searchRes.value = val
  resPage.value = 1
  resAnimKey.value++
}

function toggleCatRes(cat: RessourceCategory) {
  catRes.value = catRes.value === cat ? 'all' : cat
  resPage.value = 1
  resAnimKey.value++
}

function goToPage(page: number) {
  resPage.value = page
  resAnimKey.value++
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

function onCardEnter(el: Element, index: number) {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(24px)'
  requestAnimationFrame(() => {
    setTimeout(() => {
      htmlEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
      htmlEl.style.opacity = '1'
      htmlEl.style.transform = 'translateY(0)'
    }, index * 60)
  })
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="py-20 md:py-28">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="text-prado-text-muted text-sm mb-5 tracking-wide anim-stagger" style="--delay: 0">
          183 ressources en accès libre
        </p>
        <h1
          class="text-4xl md:text-5xl lg:text-6xl text-prado-text mb-6 anim-stagger"
          style="--delay: 1"
          :style="{ fontFamily: 'Poppins', lineHeight: 1.15 }"
        >
          Ressources professionnelles
        </h1>
        <p class="text-prado-text-muted max-w-2xl mx-auto mb-10 leading-relaxed anim-stagger" style="--delay: 2">
          Guides pratiques, fiches dispositifs, outils pédagogiques pour les professionnels de l'accompagnement.
        </p>
        <button
          class="px-8 py-3.5 rounded-full border border-prado-border-medium text-prado-text hover:bg-prado-surface-hover transition-colors anim-stagger"
          style="--delay: 3"
          @click="scrollToList"
        >
          Parcourir les ressources
        </button>
      </div>
    </div>

    <div class="h-px bg-prado-border-light" />

    <!-- Content -->
    <div ref="listRef" class="bg-prado-bg-deep min-h-screen">
      <div v-if="status === 'pending'" class="flex items-center justify-center py-20">
        <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
      </div>
      <div v-else class="max-w-7xl mx-auto px-6 py-14">
        <h2 class="text-3xl md:text-4xl text-prado-text mb-6" :style="{ fontFamily: 'Poppins' }">
          Toutes les ressources
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
          <TransitionGroup name="chip" tag="div" class="flex flex-wrap gap-2">
            <button
              v-for="c in RESSOURCE_CATEGORIES"
              :key="c"
              :class="[
                'px-4 py-2 rounded-full text-sm transition-all duration-200 border flex items-center gap-2',
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
          </TransitionGroup>
          <span class="text-sm text-prado-text-faint ml-2">{{ filteredRes.length }} ressource{{ filteredRes.length > 1 ? 's' : '' }}</span>
        </div>

        <!-- Cards grid -->
        <Transition name="grid-fade" mode="out-in">
          <div v-if="paginatedRes.length > 0" :key="resAnimKey" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="(r, i) in paginatedRes"
              :key="r.id"
              :ref="(el: any) => { if (el?.$el) onCardEnter(el.$el, i) }"
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
          <div v-else :key="'empty-res'" class="text-center py-20 text-prado-text-faint">
            <p>Aucune ressource ne correspond à vos critères.</p>
          </div>
        </Transition>

        <!-- Pagination -->
        <div v-if="resTotalPages > 1" class="flex items-center justify-center gap-2 mt-12">
          <button
            :disabled="resPage === 1"
            class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(resPage - 1)"
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
              @click="goToPage(p as number)"
            >
              {{ p }}
            </button>
          </template>
          <button
            :disabled="resPage === resTotalPages"
            class="p-2 rounded-full text-prado-text-muted hover:text-prado-text hover:bg-prado-surface-hover disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(resPage + 1)"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anim-stagger {
  animation: fadeInUp 0.5s ease both;
  animation-delay: calc(var(--delay, 0) * 80ms);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.grid-fade-enter-active { transition: opacity 0.3s ease; }
.grid-fade-leave-active { transition: opacity 0.15s ease; }
.grid-fade-enter-from, .grid-fade-leave-to { opacity: 0; }

.chip-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.chip-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.chip-enter-from { opacity: 0; transform: scale(0.9); }
.chip-leave-to { opacity: 0; transform: scale(0.9); }
.chip-move { transition: transform 0.25s ease; }
</style>
