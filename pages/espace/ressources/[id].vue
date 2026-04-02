<script setup lang="ts">
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-vue-next'
import * as prismicH from '@prismicio/client'
import {
  RESSOURCE_CATEGORY_COLORS,
  type RessourceCategory,
} from '~/constants/categories'

definePageMeta({ layout: 'espace', middleware: 'auth' })

const route = useRoute()
const { client: prismic } = usePrismic()
const { getRessourceImage } = useImages()

const id = route.params.id as string

const { data: ressourceDoc, status } = await useAsyncData(`espace-ressource-${id}`, async () => {
  try {
    return await prismic.getByUID('ressource', id)
  } catch {
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
  return {
    id: doc.uid ?? doc.data.original_id,
    title: doc.data.title as string,
    category: doc.data.category as string,
    description: doc.data.description ?? [{ type: 'paragraph', text: '', spans: [] }],
    url: doc.data.url?.url ?? '',
    image: doc.data.image?.url ?? getRessourceImage(doc.data.original_id as number),
  }
})

const color = computed(() =>
  ressource.value
    ? RESSOURCE_CATEGORY_COLORS[ressource.value.category as RessourceCategory]
    : '#FB6223'
)
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <Loader2 class="animate-spin text-prado-text-muted" :size="28" />
  </div>

  <div v-else-if="!ressource" class="max-w-3xl mx-auto py-16 text-center">
    <h1 class="text-xl text-prado-text mb-3">Ressource non trouvee</h1>
    <NuxtLink to="/espace/ressources" class="text-[var(--prado-signature-accent)] text-sm">Retour aux ressources</NuxtLink>
  </div>

  <div v-else class="max-w-3xl mx-auto space-y-6">
    <NuxtLink to="/espace/ressources" class="inline-flex items-center gap-1.5 text-prado-text-muted hover:text-prado-text text-sm transition-colors">
      <ArrowLeft :size="14" /> Retour aux ressources
    </NuxtLink>

    <!-- Image -->
    <div class="rounded-xl overflow-hidden bg-prado-surface flex items-center justify-center p-6">
      <ImageWithFallback :src="ressource.image" :alt="ressource.title" class="max-h-60 object-contain" />
    </div>

    <!-- Category -->
    <div>
      <span class="px-3 py-1 rounded-full text-xs text-white" :style="{ backgroundColor: color }">{{ ressource.category }}</span>
    </div>

    <!-- Title -->
    <h1 class="text-2xl text-prado-text font-semibold">{{ ressource.title }}</h1>

    <!-- Description -->
    <div class="text-prado-text-muted leading-relaxed prose prose-sm max-w-none">
      <PrismicRichText :field="ressource.description" />
    </div>

    <!-- CTA -->
    <a
      v-if="ressource.url"
      :href="ressource.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] text-sm hover:bg-[var(--prado-signature)]/80 transition-colors"
    >
      <ExternalLink :size="15" />
      Acceder a la ressource
    </a>
  </div>
</template>
