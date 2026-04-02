<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { asHTML } from '@prismicio/client'
import { richTextSerializer } from '~/utils/prismicSerializer'

const props = defineProps<{ data?: any }>()

const containerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const p = computed(() => props.data?.primary)

const surtitle = computed(() =>
  p.value?.surtitle || 'Association de la Fondation du Prado — Lyon Métropole'
)

const titleHtml = computed(() => {
  if (p.value?.title?.length) {
    return asHTML(p.value.title, { serializer: richTextSerializer })
  }
  return '<p>Accompagner les jeunes de <span class="text-[#FB6223]">11 à 25 ans</span> et leurs familles vers l\'autonomie.</p>'
})

const descriptionHtml = computed(() => {
  if (p.value?.description?.length) {
    return asHTML(p.value.description)
  }
  return '<p>Ateliers, formations, ressources, dispositifs d\'insertion&nbsp;: nous relions les publics accompagnés à des <span class="text-prado-text">partenaires engagés</span>, des <span class="text-prado-text">environnements porteurs</span>, pour que chacun puisse prendre conscience de son <span class="text-prado-text">pouvoir d\'agir</span>.</p>'
})

const ctaPrimary = computed(() => ({
  label: p.value?.cta_primary_label || 'Découvrir nos actions',
  to: p.value?.cta_primary_link?.url || '/actions',
}))

const ctaSecondary = computed(() => ({
  label: p.value?.cta_secondary_label || 'Inscrire un jeune',
  to: p.value?.cta_secondary_link?.url || '/connexion?mode=register',
}))

onMounted(() => {
  if (!containerRef.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.2 },
  )
  observer.observe(containerRef.value)
})
</script>

<template>
  <div ref="containerRef" class="max-w-4xl mx-auto">
    <!-- Sur-titre -->
    <p
      class="text-[#FB6223] text-sm tracking-widest uppercase text-center mb-8 hero-reveal"
      :class="isVisible ? 'is-visible' : ''"
      style="--delay: 0s;"
    >
      {{ surtitle }}
    </p>

    <!-- Texte principal -->
    <div class="space-y-6 mb-12">
      <div
        class="prismic-title text-2xl md:text-3xl text-prado-text text-center leading-snug font-medium hero-reveal"
        :class="isVisible ? 'is-visible' : ''"
        style="--delay: 0.15s;"
        v-html="titleHtml"
      />

      <div
        class="prismic-desc text-prado-text-secondary text-center text-lg leading-relaxed max-w-2xl mx-auto hero-reveal"
        :class="isVisible ? 'is-visible' : ''"
        style="--delay: 0.3s;"
        v-html="descriptionHtml"
      />
    </div>

    <!-- Ligne de séparation subtile -->
    <div
      class="w-16 h-px bg-gradient-to-r from-[#FB6223] via-[#FB6223] to-[#FB6223] mx-auto mb-10 hero-reveal"
      :class="isVisible ? 'is-visible' : ''"
      style="--delay: 0.45s;"
    />

    <!-- CTAs -->
    <div
      class="flex flex-wrap justify-center gap-4 hero-reveal"
      :class="isVisible ? 'is-visible' : ''"
      style="--delay: 0.55s;"
    >
      <NuxtLink
        :to="ctaPrimary.to"
        class="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FB6223] text-white hover:bg-[#FB6223]/90 transition-all font-medium"
      >
        {{ ctaPrimary.label }}
        <ArrowRight :size="16" class="group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
      <NuxtLink
        :to="ctaSecondary.to"
        class="px-8 py-3.5 rounded-full border border-prado-orange text-prado-orange hover:bg-prado-orange/10 transition-colors font-medium"
      >
        {{ ctaSecondary.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hero-reveal {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(4px);
  transition:
    opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay, 0s);
}

.hero-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.prismic-title :deep(p),
.prismic-desc :deep(p) {
  margin: 0;
}
</style>
