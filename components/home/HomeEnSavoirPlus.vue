<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const cards = [
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
</script>

<template>
  <section class="py-24 relative overflow-hidden">
    <!-- Halo -->
    <div class="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full bg-[#FB6223]/[0.04] blur-3xl pointer-events-none" />

    <div class="max-w-7xl mx-auto px-6 relative z-10">
      <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-12">
        En savoir plus
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <NuxtLink
          v-for="card in cards"
          :key="card.title"
          :to="card.to"
          class="group bg-prado-surface rounded-2xl p-6 border border-prado-border hover:border-prado-border-light transition-all flex flex-col"
        >
          <h3 class="text-prado-text mb-3">{{ card.title }}</h3>
          <p class="text-sm text-prado-text-secondary leading-relaxed flex-1">{{ card.text }}</p>
          <span class="inline-flex items-center gap-1.5 text-sm text-[#FB6223] group-hover:gap-2.5 transition-all mt-6">
            {{ card.cta }} <ArrowRight :size="14" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
