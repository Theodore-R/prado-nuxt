<script setup lang="ts">
import { Check, Users, Heart } from 'lucide-vue-next'

const missionsJeunes = [
  'Décloisonner les interventions et éviter les ruptures dans les parcours',
  'Offrir des nouvelles perspectives aux jeunes',
  'Impliquer toutes les parties prenantes pour répondre aux besoins des jeunes',
  'Apporter des nouvelles ressources aux professionnels éducatifs',
]

const missionsFamilles = [
  'Améliorer les relations intra-familiales',
  'Reconnaître les compétences et les habiletés des parents en mettant le focus sur l\'efficacité',
  'Outiller les parents concrètement',
  'Mettre en place un réseau de soutien',
  'Proposer de nouvelles méthodes collaboratives aux professionnels',
]
</script>

<template>
  <section class="py-24">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-6">
        Nos missions
      </h2>

      <!-- Intro -->
      <p class="text-prado-text-secondary text-base leading-relaxed text-center max-w-3xl mx-auto mb-12">
        Association loi 1901 créée le 21 janvier 2021 par la Fondation du Prado, Prado Itinéraires construit des solutions nouvelles et complémentaires dans le but de relier les publics accompagnés à des partenaires engagés, des environnements porteurs et favorables, afin qu'ils puissent prendre conscience de leur pouvoir d'agir et trouver leur place. L'association propose des actions concrètes au bénéfice des jeunes, des familles du Prado et d'autres acteurs de l'accompagnement.
      </p>

      <!-- Two columns -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <!-- Pour les jeunes -->
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#CF006C]/15">
              <Users :size="20" class="text-[#CF006C]" />
            </div>
            <h3 class="text-xl text-prado-text">Pour les jeunes</h3>
          </div>
          <ul class="space-y-4">
            <li
              v-for="(mission, idx) in missionsJeunes"
              :key="idx"
              class="flex items-start gap-3"
            >
              <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#CF006C]/15">
                <Check :size="12" class="text-[#CF006C]" />
              </div>
              <span class="text-prado-text-secondary leading-relaxed">{{ mission }}</span>
            </li>
          </ul>
        </div>

        <!-- Pour les familles -->
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[#C18ED8]/15">
              <Heart :size="20" class="text-[#C18ED8]" />
            </div>
            <h3 class="text-xl text-prado-text">Pour les familles</h3>
          </div>
          <ul class="space-y-4">
            <li
              v-for="(mission, idx) in missionsFamilles"
              :key="idx"
              class="flex items-start gap-3"
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
