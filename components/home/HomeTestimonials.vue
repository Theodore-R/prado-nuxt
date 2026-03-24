<script setup lang="ts">
interface Testimonial {
  text: string
  name: string
  role: string
  org: string
}

const testimonials: Testimonial[] = [
  {
    text: 'Les actions Prado Itinéraires nous permettent de proposer des activités variées et de qualité aux jeunes que nous accompagnons. La médiation animale, les ateliers cuisine, le théâtre — ce sont des leviers de remobilisation que nous ne pourrions pas mettre en place seuls. Et la plateforme simplifie énormément les inscriptions.',
    name: 'Marie D.',
    role: 'Éducatrice spécialisée',
    org: 'Maison d\'Enfants du Rhône',
  },
  {
    text: 'La Fresque de la Protection de l\'Enfance a été un moment fort pour notre équipe. En 2h30, nous avons compris des choses sur les parcours des jeunes que nous n\'avions jamais prises le temps d\'analyser ensemble. Nous recommandons cet atelier à toutes les structures du secteur.',
    name: 'Thomas R.',
    role: 'Chef de service éducatif',
    org: 'Département du Rhône',
  },
  {
    text: 'Les ressources en ligne sont un outil précieux pour notre pratique quotidienne. Quand un jeune a besoin d\'une aide au logement, d\'un dispositif de santé ou d\'une formation, on trouve toujours la bonne fiche sur Prado Itinéraires.',
    name: 'Sofia K.',
    role: 'Conseillère en insertion',
    org: 'Mission Locale de Lyon',
  },
]

const colors = ['#CF006C', '#FB6223', '#C18ED8', '#93C1AF']
const firstColumn = testimonials
const secondColumn = [...testimonials].reverse()
const thirdColumn = [...testimonials.slice(1), testimonials[0]]
const fourthColumn = [...testimonials.slice(2), ...testimonials.slice(0, 2)]
</script>

<template>
  <section class="py-20 relative">
    <!-- Header -->
    <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-12 px-6">
      Ils travaillent avec nous
    </h2>

    <!-- Columns — full width, no max-w container -->
    <div
      class="flex justify-center gap-6 max-h-[600px] overflow-hidden px-6"
      style="mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);"
    >
      <!-- Column 1 -->
      <div class="w-full max-w-xs shrink-0">
        <div class="testimonial-scroll flex flex-col gap-6 pb-6" style="--duration: 25s;">
          <template v-for="loop in 2" :key="'c1-' + loop">
            <div
              v-for="(t, i) in firstColumn"
              :key="'c1-' + loop + '-' + i"
              class="p-8 rounded-3xl border border-prado-border bg-prado-surface max-w-xs w-full"
            >
              <p class="text-prado-text-secondary text-sm leading-relaxed italic">
                « {{ t.text }} »
              </p>
              <div class="flex items-center gap-3 mt-5">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  :style="{ backgroundColor: colors[0] + '20', color: colors[0] }"
                >
                  {{ t.name.charAt(0) }}
                </div>
                <div>
                  <div class="text-prado-text text-sm font-medium leading-5">{{ t.name }}</div>
                  <div class="text-prado-text-muted text-xs leading-5">{{ t.role }}, {{ t.org }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Column 2 (hidden on mobile) -->
      <div class="hidden md:block w-full max-w-xs shrink-0">
        <div class="testimonial-scroll flex flex-col gap-6 pb-6" style="--duration: 30s;">
          <template v-for="loop in 2" :key="'c2-' + loop">
            <div
              v-for="(t, i) in secondColumn"
              :key="'c2-' + loop + '-' + i"
              class="p-8 rounded-3xl border border-prado-border bg-prado-surface max-w-xs w-full"
            >
              <p class="text-prado-text-secondary text-sm leading-relaxed italic">
                « {{ t.text }} »
              </p>
              <div class="flex items-center gap-3 mt-5">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  :style="{ backgroundColor: colors[1] + '20', color: colors[1] }"
                >
                  {{ t.name.charAt(0) }}
                </div>
                <div>
                  <div class="text-prado-text text-sm font-medium leading-5">{{ t.name }}</div>
                  <div class="text-prado-text-muted text-xs leading-5">{{ t.role }}, {{ t.org }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Column 3 (hidden on tablet and mobile) -->
      <div class="hidden lg:block w-full max-w-xs shrink-0">
        <div class="testimonial-scroll flex flex-col gap-6 pb-6" style="--duration: 22s;">
          <template v-for="loop in 2" :key="'c3-' + loop">
            <div
              v-for="(t, i) in thirdColumn"
              :key="'c3-' + loop + '-' + i"
              class="p-8 rounded-3xl border border-prado-border bg-prado-surface max-w-xs w-full"
            >
              <p class="text-prado-text-secondary text-sm leading-relaxed italic">
                « {{ t.text }} »
              </p>
              <div class="flex items-center gap-3 mt-5">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  :style="{ backgroundColor: colors[2] + '20', color: colors[2] }"
                >
                  {{ t.name.charAt(0) }}
                </div>
                <div>
                  <div class="text-prado-text text-sm font-medium leading-5">{{ t.name }}</div>
                  <div class="text-prado-text-muted text-xs leading-5">{{ t.role }}, {{ t.org }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Column 4 (hidden below xl) -->
      <div class="hidden xl:block w-full max-w-xs shrink-0">
        <div class="testimonial-scroll flex flex-col gap-6 pb-6" style="--duration: 27s;">
          <template v-for="loop in 2" :key="'c4-' + loop">
            <div
              v-for="(t, i) in fourthColumn"
              :key="'c4-' + loop + '-' + i"
              class="p-8 rounded-3xl border border-prado-border bg-prado-surface max-w-xs w-full"
            >
              <p class="text-prado-text-secondary text-sm leading-relaxed italic">
                « {{ t.text }} »
              </p>
              <div class="flex items-center gap-3 mt-5">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  :style="{ backgroundColor: colors[3] + '20', color: colors[3] }"
                >
                  {{ t.name.charAt(0) }}
                </div>
                <div>
                  <div class="text-prado-text text-sm font-medium leading-5">{{ t.name }}</div>
                  <div class="text-prado-text-muted text-xs leading-5">{{ t.role }}, {{ t.org }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Note -->
    <p class="text-prado-text-faint text-xs text-center mt-8 italic px-6">
      Témoignages représentatifs du secteur — à remplacer par de vrais témoignages avant publication.
    </p>
  </section>
</template>

<style scoped>
@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.testimonial-scroll {
  animation: scroll-up var(--duration, 25s) linear infinite;
}

.testimonial-scroll:hover {
  animation-play-state: paused;
}
</style>
