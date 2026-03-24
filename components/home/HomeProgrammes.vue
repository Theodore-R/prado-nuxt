<script setup lang="ts">
import { ArrowRight, Users, Truck, Heart, BookOpen } from 'lucide-vue-next'

interface ProgrammeCta {
  label: string
  to: string
}

interface Programme {
  id: string
  title: string
  shortTitle: string
  icon: typeof Users
  color: string
  text: string[]
  ctas: ProgrammeCta[]
}

const programmes: Programme[] = [
  {
    id: 'jeunes',
    title: 'Programme Jeunes & Autonomes',
    shortTitle: 'Jeunes & Autonomes',
    icon: Users,
    color: '#CF006C',
    text: [
      'Prado Itinéraires agit en faveur de l\'autonomie des jeunes de 11 à 25 ans bénéficiant d\'un accompagnement éducatif — Aide Sociale à l\'Enfance, Protection Judiciaire de la Jeunesse, handicap, prévention — pour les structures du Prado et les structures partenaires de la Métropole de Lyon, du Rhône, de l\'Ain et de l\'Isère.',
      '89 actions et ateliers programmés toute l\'année\u00a0: bien-être et estime de soi, découverte des métiers, vie quotidienne, mobilité, numérique, droits, emploi. En individuel ou en groupe, à organiser dans vos locaux ou dans les nôtres.',
      '183 ressources professionnelles en accès libre\u00a0: guides pratiques, fiches dispositifs, outils pédagogiques pour les professionnels de l\'accompagnement.',
    ],
    ctas: [
      { label: 'Découvrir le catalogue d\'actions', to: '/actions' },
      { label: 'Accéder aux ressources', to: '/ressources' },
      { label: 'Inscrire un jeune', to: '/connexion?mode=register' },
    ],
  },
  {
    id: 'foodtruck',
    title: 'Foodtruck « Les Saveurs d\'Élise »',
    shortTitle: 'Foodtruck',
    icon: Truck,
    color: '#FB6223',
    text: [
      'Concept pédagogique et inclusif, « Les Saveurs d\'Élise » est une offre de restauration mobile qui favorise l\'insertion socio-professionnelle des jeunes. Accueillis en stage pendant une semaine dans la cuisine centrale et en vente directe au public, les jeunes expérimentent, rencontrent, se valorisent, tout en étant accompagnés par l\'équipe du Prado.',
      'Le foodtruck sillonne la métropole lyonnaise cinq jours par semaine. Menu du jour à prix libre, ouvert à tous. Un outil d\'insertion par l\'activité économique qui mêle formation, emploi et convivialité. Stages ouverts à tous les jeunes dès 14 ans bénéficiant d\'un accompagnement éducatif.',
    ],
    ctas: [
      { label: 'Découvrir le Foodtruck', to: '/foodtruck' },
    ],
  },
  {
    id: 'parentalite',
    title: 'Compétences parentales',
    shortTitle: 'Compétences parentales',
    icon: Heart,
    color: '#C18ED8',
    text: [
      'Prado Itinéraires prend également toute sa place d\'incubateur d\'innovations sociales au bénéfice des enfants et des familles en portant le développement de deux programmes reconnus scientifiquement.',
      '« Ces Années Incroyables » (Incredible Years), déployé depuis 2014\u00a0: un programme de groupe pour les parents d\'enfants de 3 à 12 ans qui rencontrent des difficultés éducatives. Évalué internationalement, il vise à reconnaître les compétences des parents et à les outiller concrètement.',
      '« Parent d\'Ado… une traversée », lancé en septembre 2022\u00a0: un programme d\'accompagnement pour les parents d\'adolescents, centré sur l\'amélioration des relations intra-familiales et la mise en place d\'un réseau de soutien entre pairs.',
    ],
    ctas: [
      { label: 'Découvrir Ces Années Incroyables', to: '/educolab' },
      { label: 'Découvrir Parent d\'Ado', to: '/educolab' },
    ],
  },
  {
    id: 'fresque',
    title: 'La Fresque de la Protection de l\'Enfance®',
    shortTitle: 'Fresque PDE',
    icon: BookOpen,
    color: '#93C1AF',
    text: [
      'Inspiré de la Fresque du Climat, cet atelier collaboratif met en scène les parcours de trois jeunes qui donnent à voir les réalités de la protection de l\'enfance. La complexité du système, la diversité des dispositifs existants, les ruptures que vivent les enfants et les adolescents.',
      'C\'est une expérience immersive et collaborative qui combine jeu, échanges et réflexion commune afin de mieux comprendre les parcours des enfants et la complexité du système. 2h30, jusqu\'à 14 participants. L\'équipe Prado se déplace dans votre structure avec tout le matériel nécessaire.',
    ],
    ctas: [
      { label: 'En savoir plus sur la Fresque', to: '/fresque' },
    ],
  },
]

const activeId = ref(programmes[0].id)
const programmeRefs = ref<Record<string, HTMLElement | null>>({})
const sectionRef = ref<HTMLElement | null>(null)

function setProgrammeRef(id: string, el: HTMLElement | null) {
  programmeRefs.value[id] = el
}

function scrollToProgram(id: string) {
  const el = programmeRefs.value[id]
  if (el) {
    const offset = window.innerHeight * 0.5 - 50
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function handleScroll() {
  const threshold = window.innerHeight * 0.5

  for (let i = programmes.length - 1; i >= 0; i--) {
    const el = programmeRefs.value[programmes[i].id]
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= threshold) {
        activeId.value = programmes[i].id
        return
      }
    }
  }
  activeId.value = programmes[0].id
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <section ref="sectionRef" class="relative">
    <HomeHalo color="#CF006C" position="top-right" :size="700" :opacity="0.06" />

    <div class="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
      <h2 class="text-3xl md:text-4xl text-prado-text text-center">
        Quatre programmes pour agir concrètement
      </h2>
    </div>

    <div class="max-w-7xl mx-auto px-6 pb-24">
      <!-- Desktop: split layout, page scroll -->
      <div class="hidden lg:flex gap-12 items-start">
        <!-- Left: sticky nav (top-[30vh] keeps it below the title area) -->
        <nav class="w-72 shrink-0 sticky top-[30vh] self-start">
          <ul class="space-y-1">
            <li v-for="prog in programmes" :key="prog.id">
              <button
                class="w-full text-left px-4 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 cursor-pointer"
                :class="activeId === prog.id
                  ? 'bg-prado-surface border border-prado-border-light'
                  : 'border border-transparent hover:bg-prado-surface/50'"
                @click="scrollToProgram(prog.id)"
              >
                <div
                  class="w-3 h-3 rounded-full shrink-0 transition-all duration-300"
                  :style="{
                    backgroundColor: activeId === prog.id ? prog.color : 'transparent',
                    border: `2px solid ${activeId === prog.id ? prog.color : 'rgba(255,255,255,0.15)'}`,
                  }"
                />
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                  :style="{
                    backgroundColor: activeId === prog.id ? prog.color + '20' : 'transparent',
                  }"
                >
                  <component
                    :is="prog.icon"
                    :size="18"
                    :style="{ color: activeId === prog.id ? prog.color : 'rgba(255,255,255,0.3)' }"
                    class="transition-colors duration-300"
                  />
                </div>
                <span
                  class="text-sm font-medium transition-colors duration-300"
                  :style="{ color: activeId === prog.id ? prog.color : 'rgba(255,255,255,0.4)' }"
                >
                  {{ prog.shortTitle }}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Right: content flows with page scroll -->
        <div class="flex-1">
          <div
            v-for="prog in programmes"
            :key="prog.id"
            :ref="(el: any) => setProgrammeRef(prog.id, el as HTMLElement)"
            class="mb-20 last:mb-0 transition-opacity duration-500"
            :class="activeId === prog.id ? 'opacity-100' : 'opacity-30'"
          >
            <!-- Programme header -->
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-1 h-8 rounded-full transition-colors duration-300"
                :style="{ backgroundColor: activeId === prog.id ? prog.color : 'rgba(255,255,255,0.1)' }"
              />
              <h3 class="text-xl md:text-2xl text-prado-text">
                {{ prog.title }}
              </h3>
            </div>

            <!-- Programme text -->
            <div class="space-y-4 pl-5">
              <p
                v-for="(paragraph, idx) in prog.text"
                :key="idx"
                class="text-prado-text-secondary leading-relaxed"
              >
                {{ paragraph }}
              </p>
            </div>

            <!-- CTAs (visible only when active, space always reserved) -->
            <div
              class="flex flex-wrap gap-3 mt-8 pl-5 transition-all duration-300"
              :class="activeId === prog.id ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <NuxtLink
                v-for="cta in prog.ctas"
                :key="cta.label"
                :to="cta.to"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:brightness-125"
                :style="{
                  backgroundColor: prog.color + '15',
                  color: prog.color,
                }"
              >
                {{ cta.label }}
                <ArrowRight :size="14" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile: vertical stacked -->
      <div class="lg:hidden space-y-8">
        <div
          v-for="prog in programmes"
          :key="prog.id"
          class="bg-prado-surface rounded-2xl p-6 border border-prado-border"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: prog.color + '20' }"
            >
              <component :is="prog.icon" :size="20" :style="{ color: prog.color }" />
            </div>
            <h3 class="text-lg text-prado-text font-medium">
              {{ prog.shortTitle }}
            </h3>
          </div>

          <div class="space-y-3">
            <p
              v-for="(paragraph, idx) in prog.text"
              :key="idx"
              class="text-sm text-prado-text-secondary leading-relaxed"
            >
              {{ paragraph }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2 mt-6">
            <NuxtLink
              v-for="cta in prog.ctas"
              :key="cta.label"
              :to="cta.to"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              :style="{
                backgroundColor: prog.color + '15',
                color: prog.color,
              }"
            >
              {{ cta.label }}
              <ArrowRight :size="13" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
