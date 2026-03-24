<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const steps = [
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
</script>

<template>
  <section class="py-24 bg-prado-bg-teal">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-12">
        Comment inscrire un jeune ?
      </h2>

      <!-- 3 cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="step in steps"
          :key="step.number"
          class="bg-prado-surface rounded-2xl p-8 border border-prado-border"
        >
          <div class="text-5xl font-bold text-prado-text-faint mb-4">
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
      <div class="mt-12 text-center">
        <NuxtLink
          to="/connexion?mode=register"
          class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#CF006C] text-white hover:bg-[#CF006C]/90 transition-colors font-medium"
        >
          Créer mon compte gratuitement
          <ArrowRight :size="16" />
        </NuxtLink>
        <p class="text-prado-text-muted text-sm mt-4">
          100% gratuit · Sans engagement · Réservé aux professionnels de l'accompagnement
        </p>
      </div>
    </div>
  </section>
</template>
