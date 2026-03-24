<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="py-24 bg-gradient-to-r from-[#CF006C] to-[#FB6223]">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-3xl md:text-4xl text-white mb-8">
        Agir ensemble pour l'autonomie des jeunes
      </h2>
      <p class="text-white/80 text-base leading-relaxed mb-10 max-w-2xl mx-auto">
        Que vous soyez professionnel de l'accompagnement, partenaire institutionnel, ou simplement engagé pour la jeunesse, il y a une place pour vous dans le projet Prado Itinéraires. Inscrivez un jeune à une action, organisez une Fresque dans votre structure, accueillez le Foodtruck dans votre quartier, ou soutenez nos programmes.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink
          to="/connexion?mode=register"
          class="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#1a1a2e] hover:bg-white/90 transition-colors font-medium"
        >
          Créer un compte
          <ArrowRight :size="16" />
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="px-7 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
        >
          Nous contacter
        </NuxtLink>
      </div>
      <p class="text-white/50 text-sm mt-6">
        Association loi 1901 · Fondation du Prado · Gratuit et ouvert à tous les acteurs de l'accompagnement
      </p>
    </div>
  </section>
</template>
