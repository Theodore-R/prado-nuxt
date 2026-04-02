<script setup lang="ts">
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-vue-next'
import * as prismicH from '@prismicio/client'
import {
  RESSOURCE_CATEGORY_COLORS,
  type RessourceCategory,
} from '~/constants/categories'

const route = useRoute()
const { client: prismic } = usePrismic()
const { getRessourceImage } = useImages()

const id = route.params.id as string

const { data: ressourceDoc, status } = await useAsyncData(`ressource-${id}`, async () => {
  // Try by UID first (new format)
  try {
    return await prismic.getByUID('ressource', id)
  } catch {
    // Fallback: try by original_id (legacy format)
    const res = await prismic.get({
      filters: [prismicH.filter.at('my.ressource.original_id', Number(id))],
      pageSize: 1,
    })
    // useAsyncData requires non-null return; empty object signals fetch failure (consumers check .data)
    return res.results?.[0] ?? ({} as Record<string, never>)
  }
})

const loading = computed(() => status.value === 'pending')

const ressource = computed(() => {
  const doc = ressourceDoc.value
  if (!doc?.data) return null
  const data = doc.data as any
  return {
    id: doc.uid ?? data.original_id,
    title: data.title as string,
    category: data.category as string,
    description: data.description ?? [{ type: 'paragraph', text: '', spans: [] }],
    url: data.url?.url ?? '',
    image: data.image?.url ?? getRessourceImage(data.original_id as number),
  }
})

const color = computed(() =>
  ressource.value
    ? RESSOURCE_CATEGORY_COLORS[ressource.value.category as RessourceCategory]
    : '#FB6223'
)
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-32">
    <Loader2 class="animate-spin text-prado-text-muted" :size="32" />
  </div>

  <div v-else-if="!ressource" class="max-w-7xl mx-auto px-6 py-20 text-center">
    <h1 class="text-2xl text-prado-text">Ressource non trouvee</h1>
    <NuxtLink to="/ressources" class="text-[var(--prado-signature-accent)] mt-4 inline-block">Retour a la programmation</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto px-6 py-10">
    <NuxtLink to="/ressources" class="inline-flex items-center gap-2 text-prado-text-muted hover:text-[var(--prado-signature-accent)] mb-8 transition-colors text-sm">
      <ArrowLeft :size="15" /> Retour aux ressources
    </NuxtLink>

    <div class="rounded-2xl overflow-hidden mb-8 bg-prado-surface flex items-center justify-center p-8">
      <ImageWithFallback :src="ressource.image" :alt="ressource.title" class="max-h-72 object-contain" />
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <span class="px-3 py-1 rounded-full text-xs text-white" :style="{ backgroundColor: color }">{{ ressource.category }}</span>
    </div>

    <h1 class="text-3xl text-prado-text mb-4" :style="{ fontFamily: 'Poppins' }">{{ ressource.title }}</h1>
    <div class="text-prado-text-muted mb-8 leading-relaxed prose prose-sm max-w-none">
      <PrismicRichText :field="ressource.description" />
    </div>

    <a
      :href="ressource.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/80 transition-colors"
    >
      <ExternalLink :size="16" />
      Acceder a la ressource
    </a>
  </div>
</template>
