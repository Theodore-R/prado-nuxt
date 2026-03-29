<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

interface Card {
  title: string
  text: string
  cta: string
  to: string
}

const props = defineProps<{ data?: any }>()

const sectionTitle = computed(() =>
  props.data?.primary?.section_title || 'En savoir plus'
)

const defaultCards: Card[] = [
  {
    title: 'Connaître notre organisation',
    text: 'Travailler avec toutes les personnes concernées\u00a0: un conseil d\'administration mixte et une équipe impliquée.',
    cta: 'Découvrir',
    to: '/organisation',
  },
  {
    title: 'Rapport d\'activité 2024',
    text: 'Découvrir le détail des actions menées en 2024 ainsi que les perspectives 2025.',
    cta: 'Consulter',
    to: '/rapport-activite',
  },
  {
    title: 'Mesure d\'impact social',
    text: 'Identifier les freins et les points forts de l\'offre proposée dans une démarche continue d\'innovation et d\'évolution.',
    cta: 'Lire l\'étude',
    to: '/impact-social',
  },
  {
    title: 'Recueil des pratiques inspirantes',
    text: 'Une année inspirante pour le programme Ces Années Incroyables.',
    cta: 'Découvrir',
    to: '/pratiques-inspirantes',
  },
]

const cards = computed<Card[]>(() => {
  if (props.data?.items?.length) {
    return props.data.items.map((item: any) => ({
      title: item.title || '',
      text: item.description || '',
      cta: item.cta_label || 'Découvrir',
      to: item.link?.url || '#',
    }))
  }
  return defaultCards
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  if (!sectionRef.value) return
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.25 },
  )
  observer.observe(sectionRef.value)
})
</script>

<template>
  <section ref="sectionRef" class="py-24 relative">
    <HomeHalo color="#FFD228" position="top-right" :size="600" :opacity="0.06" />

    <div class="max-w-7xl mx-auto px-6 relative z-10">
      <h2
        class="text-3xl md:text-4xl text-prado-text text-center mb-12 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0s;"
      >
        {{ sectionTitle }}
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <NuxtLink
          v-for="(card, idx) in cards"
          :key="card.title"
          :to="card.to"
          class="group bg-prado-surface rounded-2xl p-6 border border-prado-border hover:border-prado-border-light transition-all flex flex-col reveal"
          :class="isVisible && 'is-visible'"
          :style="{ '--delay': `${0.1 + idx * 0.1}s` }"
        >
          <h3 class="text-prado-text mb-3">{{ card.title }}</h3>
          <p class="text-sm text-prado-text-secondary leading-relaxed flex-1">{{ card.text }}</p>
          <span class="inline-flex items-center gap-1.5 text-sm text-[var(--prado-signature-accent)] group-hover:gap-2.5 transition-all mt-6">
            {{ card.cta }} <ArrowRight :size="14" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay, 0s);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
