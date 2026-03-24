<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'C\'est pour qui\u00a0?',
    answer: 'Les actions Prado Itinéraires s\'adressent aux jeunes de 11 à 25 ans bénéficiant d\'un accompagnement éducatif (ASE, PJJ, handicap, prévention) sur le territoire de la Métropole de Lyon, du Rhône, de l\'Ain et de l\'Isère. L\'inscription se fait par un professionnel référent qui accompagne le jeune. Les programmes parentaux sont ouverts aux familles accompagnées par les structures partenaires.',
  },
  {
    question: 'C\'est gratuit\u00a0?',
    answer: 'Oui, entièrement. Toutes les actions, ateliers, formations et ressources sont 100\u00a0% gratuits pour les jeunes, les familles et les professionnels. Prado Itinéraires est financé par la Fondation du Prado et ses partenaires institutionnels.',
  },
  {
    question: 'Qui est Prado Itinéraires\u00a0?',
    answer: 'Une association loi 1901 créée le 21 janvier 2021 par la Fondation du Prado, acteur de la protection de l\'enfance depuis 1860. L\'équipe est composée d\'éducateurs spécialisés, de chargés de projet et de coordinateurs pédagogiques qui conçoivent et animent les actions.',
  },
  {
    question: 'Comment participer ou soutenir l\'association\u00a0?',
    answer: 'Vous pouvez orienter des jeunes vers nos actions en créant un compte prescripteur. Vous pouvez aussi accueillir le foodtruck dans votre quartier, organiser une Fresque dans votre structure, ou soutenir financièrement nos programmes via la Fondation du Prado. Contactez-nous pour en savoir plus.',
  },
  {
    question: 'Comment nous contacter\u00a0?',
    answer: 'Par email à itineraires@le-prado.fr, par téléphone au 04 72 XX XX XX (lundi-vendredi, 9h-17h), ou via le formulaire de contact sur notre site. L\'équipe répond sous 48h. Nous nous déplaçons volontiers pour présenter nos actions à votre structure.',
  },
]

const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section class="py-24 relative">
    <HomeHalo color="#C18ED8" position="top-center" :size="600" :opacity="0.06" />

    <div class="max-w-3xl mx-auto px-6 relative z-10">
      <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-12">
        Questions fréquentes
      </h2>

      <div class="space-y-3">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="rounded-2xl border border-prado-border overflow-hidden transition-colors"
          :class="openIndex === idx ? 'bg-prado-surface' : 'bg-transparent'"
        >
          <button
            class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
            @click="toggle(idx)"
          >
            <span class="text-prado-text font-medium">{{ faq.question }}</span>
            <ChevronDown
              :size="20"
              class="shrink-0 text-prado-text-muted transition-transform duration-300"
              :class="openIndex === idx ? 'rotate-180' : ''"
            />
          </button>
          <div
            class="grid transition-all duration-300 ease-in-out"
            :class="openIndex === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
          >
            <div class="overflow-hidden">
              <p class="px-6 pb-5 text-prado-text-secondary leading-relaxed">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
