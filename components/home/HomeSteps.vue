<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const props = defineProps<{ data?: any }>()

const p = computed(() => props.data?.primary)

const sectionTitle = computed(() => p.value?.section_title || 'Comment inscrire un jeune ?')
const ctaLabel = computed(() => p.value?.cta_label || 'Créer mon compte gratuitement')
const ctaLink = computed(() => p.value?.cta_link?.url || '/connexion?mode=register')
const reassurance = computed(() =>
  p.value?.reassurance_text || '100% gratuit · Sans engagement · Réservé aux professionnels de l\'accompagnement'
)

const defaultSteps = [
  {
    number: '01',
    title: 'Créez votre compte',
    text: 'Vous êtes éducateur, travailleur social, référent ASE ou PJJ, conseiller en insertion\u00a0? Créez votre compte prescripteur en 2 minutes. Renseignez votre nom, votre structure et votre email professionnel. Votre compte est validé sous 24h par notre équipe.',
  },
  {
    number: '02',
    title: 'Ajoutez un jeune',
    text: 'Créez la fiche du jeune que vous souhaitez inscrire\u00a0: prénom, nom, date de naissance, situation. Vos données sont sécurisées et conformes au RGPD. Vous pouvez créer autant de fiches que nécessaire.',
  },
  {
    number: '03',
    title: 'Inscrivez-le à une action',
    text: 'Parcourez les 89 actions disponibles, choisissez celle qui correspond, sélectionnez le jeune, confirmez. L\'inscription est immédiate. Vous pouvez l\'annuler à tout moment.',
  },
]

const steps = computed(() => {
  if (props.data?.items?.length) {
    return props.data.items.map((item: any) => ({
      number: item.step_number || '',
      title: item.title || '',
      text: item.description || '',
    }))
  }
  return defaultSteps
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
    <HomeHalo color="#93C1AF" position="bottom-left" :size="600" :opacity="0.07" />

    <div class="max-w-7xl mx-auto px-6 relative z-10">
      <h2
        class="text-3xl md:text-4xl text-prado-text text-center mb-12 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0s;"
      >
        {{ sectionTitle }}
      </h2>

      <!-- 3 cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(step, idx) in steps"
          :key="step.number"
          class="bg-prado-surface rounded-2xl p-8 border border-prado-border reveal"
          :class="isVisible && 'is-visible'"
          :style="{ '--delay': `${0.1 + (idx as number) * 0.12}s` }"
        >
          <div class="text-5xl font-bold text-prado-orange mb-4">
            {{ step.number }}
          </div>
          <h3 class="text-lg text-prado-text mb-3">
            {{ step.title }}
          </h3>
          <p class="text-base text-prado-text-secondary leading-relaxed">
            {{ step.text }}
          </p>
        </div>
      </div>

      <!-- CTA + Réassurance -->
      <div
        class="mt-12 text-center reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0.5s;"
      >
        <NuxtLink
          :to="ctaLink"
          class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--prado-signature)] text-[var(--prado-signature-text)] hover:bg-[var(--prado-signature)]/90 transition-colors font-medium"
        >
          {{ ctaLabel }}
          <ArrowRight :size="16" />
        </NuxtLink>
        <p class="text-prado-text-muted text-sm mt-4">
          {{ reassurance }}
        </p>
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
