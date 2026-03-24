<script setup lang="ts">
interface Partner {
  name: string
  logo: string
  url: string
}

const partners: Partner[] = [
  { name: 'Fondation du Prado', logo: '/images/partenaires/fondation-du-prado.png', url: 'https://www.le-prado.fr' },
  { name: 'Métropole de Lyon', logo: '/images/partenaires/metropole-de-lyon.png', url: 'https://www.grandlyon.com' },
  { name: 'Département du Rhône', logo: '/images/partenaires/departement-du-rhone.png', url: 'https://www.rhone.fr' },
  { name: 'CAF du Rhône', logo: '/images/partenaires/caf-du-rhone.png', url: 'https://www.caf.fr/allocataires/caf-du-rhone' },
  { name: 'DDETS du Rhône', logo: '/images/partenaires/ddets-du-rhone.png', url: 'https://www.rhone.gouv.fr' },
  { name: 'Mission Locale de Lyon', logo: '/images/partenaires/mission-locale-de-lyon.png', url: 'https://www.missionlocalelyon.fr' },
  { name: 'Région Auvergne-Rhône-Alpes', logo: '/images/partenaires/region-aura.png', url: 'https://www.auvergnerhonealpes.fr' },
]

// Double the list for seamless loop
const scrollPartners = [...partners, ...partners]
</script>

<template>
  <section class="py-24">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-3xl md:text-4xl text-prado-text text-center mb-4">
        Ils nous soutiennent
      </h2>
      <p class="text-prado-text-muted text-base text-center mb-12 max-w-3xl mx-auto">
        Notre activité est rendue possible grâce au soutien de la Métropole de Lyon, de la Fondation du Prado et de leurs partenaires.
      </p>
    </div>

    <!-- Infinite scroll band -->
    <div
      class="overflow-hidden"
      style="mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);"
    >
      <div class="partner-scroll flex items-center gap-16 w-max">
        <a
          v-for="(partner, idx) in scrollPartners"
          :key="idx"
          :href="partner.url"
          target="_blank"
          rel="noopener noreferrer"
          class="shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-300"
          :title="partner.name"
        >
          <img
            :src="partner.logo"
            :alt="partner.name"
            class="h-12 md:h-16 w-auto object-contain brightness-0 invert"
          />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.partner-scroll {
  animation: scroll-left 30s linear infinite;
}

.partner-scroll:hover {
  animation-play-state: paused;
}
</style>
