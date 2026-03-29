<script setup lang="ts">
import { Check, Users, Heart } from 'lucide-vue-next'

const props = defineProps<{ data?: any }>()

const p = computed(() => props.data?.primary)

const sectionTitle = computed(() => p.value?.section_title || 'Nos missions')
const jeunesTitle = computed(() => p.value?.jeunes_title || 'Pour les jeunes')
const famillesTitle = computed(() => p.value?.familles_title || 'Pour les familles')

const introText = computed(() => {
  if (p.value?.intro_text?.length) {
    return p.value.intro_text.map((block: any) => block.text).join(' ')
  }
  return 'Association loi 1901 créée le 21 janvier 2021 par la Fondation du Prado, Prado Itinéraires construit des solutions nouvelles et complémentaires dans le but de relier les publics accompagnés à des partenaires engagés, des environnements porteurs et favorables, afin qu\u2019ils puissent prendre conscience de leur pouvoir d\u2019agir et trouver leur place. L\u2019association propose des actions concrètes au bénéfice des jeunes, des familles du Prado et d\u2019autres acteurs de l\u2019accompagnement.'
})

const defaultMissionsJeunes = [
  'Décloisonner les interventions et éviter les ruptures dans les parcours',
  'Offrir des nouvelles perspectives aux jeunes',
  'Impliquer toutes les parties prenantes pour répondre aux besoins des jeunes',
  'Apporter des nouvelles ressources aux professionnels éducatifs',
]

const defaultMissionsFamilles = [
  'Améliorer les relations intra-familiales',
  'Reconnaître les compétences et les habiletés des parents en mettant le focus sur l\'efficacité',
  'Outiller les parents concrètement',
  'Mettre en place un réseau de soutien',
  'Proposer de nouvelles méthodes collaboratives aux professionnels',
]

const missionsJeunes = computed(() => {
  if (props.data?.items?.length) {
    return props.data.items
      .filter((item: any) => item.category === 'jeunes')
      .map((item: any) => item.text as string)
  }
  return defaultMissionsJeunes
})

const missionsFamilles = computed(() => {
  if (props.data?.items?.length) {
    return props.data.items
      .filter((item: any) => item.category === 'familles')
      .map((item: any) => item.text as string)
  }
  return defaultMissionsFamilles
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
  <section ref="sectionRef" class="py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <h2
        class="text-3xl md:text-4xl text-prado-text text-center mb-6 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0s;"
      >
        {{ sectionTitle }}
      </h2>

      <!-- Intro -->
      <p
        class="text-prado-text-secondary text-base leading-relaxed text-center max-w-3xl mx-auto mb-12 reveal"
        :class="isVisible && 'is-visible'"
        style="--delay: 0.1s;"
      >
        {{ introText }}
      </p>

      <!-- Two columns -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <!-- Pour les jeunes -->
        <div
          class="reveal"
          :class="isVisible && 'is-visible'"
          style="--delay: 0.2s;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--prado-signature)]/15">
              <Users :size="20" class="text-[var(--prado-signature-accent)]" />
            </div>
            <h3 class="text-xl text-prado-text">{{ jeunesTitle }}</h3>
          </div>
          <ul class="space-y-4">
            <li
              v-for="(mission, idx) in missionsJeunes"
              :key="idx"
              class="flex items-start gap-3 reveal"
              :class="isVisible && 'is-visible'"
              :style="{ '--delay': `${0.3 + idx * 0.07}s` }"
            >
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[var(--prado-signature)]/15">
                <Check :size="12" class="text-[var(--prado-signature-accent)]" />
              </div>
              <span class="text-prado-text-secondary leading-relaxed">{{ mission }}</span>
            </li>
          </ul>
        </div>

        <!-- Pour les familles -->
        <div
          class="reveal"
          :class="isVisible && 'is-visible'"
          style="--delay: 0.3s;"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C18ED8]/15">
              <Heart :size="20" class="text-[#C18ED8]" />
            </div>
            <h3 class="text-xl text-prado-text">{{ famillesTitle }}</h3>
          </div>
          <ul class="space-y-4">
            <li
              v-for="(mission, idx) in missionsFamilles"
              :key="idx"
              class="flex items-start gap-3 reveal"
              :class="isVisible && 'is-visible'"
              :style="{ '--delay': `${0.4 + idx * 0.07}s` }"
            >
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#C18ED8]/15">
                <Check :size="12" class="text-[#C18ED8]" />
              </div>
              <span class="text-prado-text-secondary leading-relaxed">{{ mission }}</span>
            </li>
          </ul>
        </div>
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
