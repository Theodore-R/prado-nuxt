<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { asHTML } from '@prismicio/client'

const props = defineProps<{ data?: any }>()

const p = computed(() => props.data?.primary)

const title = computed(() =>
  p.value?.title || 'Agir ensemble pour l\'autonomie des jeunes'
)

const descriptionHtml = computed(() => {
  if (p.value?.description?.length) {
    return asHTML(p.value.description)
  }
  return '<p>Que vous soyez professionnel de l\'accompagnement, partenaire institutionnel, ou simplement engagé pour la jeunesse, il y a une place pour vous dans le projet Prado Itinéraires. Inscrivez un jeune à une action, organisez une Fresque dans votre structure, accueillez le Foodtruck dans votre quartier, ou soutenez nos programmes.</p>'
})

const ctaPrimary = computed(() => ({
  label: p.value?.cta_primary_label || 'Créer un compte',
  to: p.value?.cta_primary_link?.url || '/connexion?mode=register',
}))

const ctaSecondary = computed(() => ({
  label: p.value?.cta_secondary_label || 'Nous contacter',
  to: p.value?.cta_secondary_link?.url || '/contact',
}))

const footerText = computed(() =>
  p.value?.footer_text || 'Association loi 1901 · Fondation du Prado · Gratuit et ouvert à tous les acteurs de l\'accompagnement'
)

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
    { threshold: 0.2 },
  )
  observer.observe(sectionRef.value)
})
</script>

<template>
  <section ref="sectionRef" class="py-24 bg-prado-teal">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2
        class="text-3xl md:text-4xl text-white mb-8 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0s;"
      >
        {{ title }}
      </h2>
      <div
        class="text-white/80 text-base leading-relaxed mb-10 max-w-2xl mx-auto prismic-cta-desc reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0.12s;"
        v-html="descriptionHtml"
      />
      <div
        class="flex flex-wrap justify-center gap-3 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0.24s;"
      >
        <NuxtLink
          :to="ctaPrimary.to"
          class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-prado-orange text-white hover:bg-prado-orange/90 transition-colors font-medium"
        >
          {{ ctaPrimary.label }}
          <ArrowRight :size="16" />
        </NuxtLink>
        <NuxtLink
          :to="ctaSecondary.to"
          class="px-7 py-3 rounded-full bg-prado-sage text-white hover:bg-prado-sage/80 transition-colors font-medium"
        >
          {{ ctaSecondary.label }}
        </NuxtLink>
        <a
          href="https://www.le-prado.fr/don/"
          target="_blank"
          rel="noopener noreferrer"
          class="px-7 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
        >
          Soutenir la Fondation
        </a>
      </div>
      <p
        class="text-white/50 text-sm mt-6 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0.35s;"
      >
        {{ footerText }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.prismic-cta-desc :deep(p) {
  margin: 0;
}

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
