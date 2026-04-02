<script setup lang="ts">
import { BookOpen, Lightbulb, Shield, Users, Heart, Clock, Calendar, Mail, Phone } from 'lucide-vue-next'

const iconMap: Record<string, any> = { BookOpen, Lightbulb, Shield, Users, Heart }

const { data: page } = await useFresque()
const d = computed(() => page.value?.data)

useHead({
  title: d.value?.meta_title || 'La Fresque de la Protection de l\'Enfance | Prado Itineraires',
  meta: d.value?.meta_description
    ? [{ name: 'description', content: d.value.meta_description }]
    : [],
})

const brandColor = computed(() => d.value?.brand_color || '#024266')
</script>

<template>
  <div v-if="d">
    <!-- Hero -->
    <div class="relative h-[45vh] min-h-[340px] flex items-end">
      <div class="absolute inset-0">
        <PrismicImage v-if="d.hero_image?.url" :field="d.hero_image" class="w-full h-full object-cover" />
        <ImageWithFallback v-else src="/images/fresque.png" alt="Atelier Fresque de la Protection de l'Enfance" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-prado-bg via-prado-bg/70 to-transparent" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
        <p class="text-sm mb-3 tracking-widest uppercase" :style="{ color: brandColor }">{{ d.surtitle }}</p>
        <h1 class="text-3xl md:text-4xl lg:text-5xl text-prado-text mb-3" :style="{ fontFamily: 'Poppins', lineHeight: 1.1 }">
          {{ d.title }}
        </h1>
        <p class="text-prado-text-muted text-lg max-w-2xl">{{ d.description }}</p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div class="lg:col-span-3 space-y-6">
          <h2 class="text-2xl md:text-3xl text-prado-text" :style="{ fontFamily: 'Poppins' }">
            {{ d.intro_title }}
          </h2>
          <div class="text-prado-text-muted leading-relaxed">
            <PrismicRichText :field="d.intro_body" />
          </div>
          <div v-if="d.testimonial_quote" class="text-prado-text-muted text-sm italic border-l-2 pl-4" :style="{ borderColor: brandColor }">
            <PrismicRichText :field="d.testimonial_quote" />
            <span v-if="d.testimonial_author" class="block mt-1 not-italic text-prado-text-faint">-- {{ d.testimonial_author }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div v-for="(item, i) in d.objectives" :key="item.label ?? i" class="bg-prado-surface rounded-2xl p-5 border border-prado-border">
              <component :is="iconMap[item.icon_name ?? ''] || BookOpen" :size="22" class="mb-3" :style="{ color: brandColor }" />
              <div class="text-prado-text text-sm mb-1">{{ item.label }}</div>
              <div class="text-prado-text-muted text-xs">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <h3 class="text-lg text-prado-text mb-2" :style="{ fontFamily: 'Poppins' }">
            {{ d.parcours?.length || 3 }} parcours de vie
          </h3>
          <p class="text-prado-text-muted text-sm mb-4">
            Des premieres annees jusqu'au passage a l'age adulte, ces parcours, nourris de temoignages reels, nous plongent au coeur des besoins concrets du terrain.
          </p>
          <div v-for="(p, i) in d.parcours" :key="p.nom ?? i" class="bg-prado-surface rounded-2xl p-5 border border-prado-border">
            <div class="flex items-center gap-3 mb-2">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: p.color ?? '#024266' }" />
              <span class="text-prado-text font-medium text-sm">{{ p.nom }}</span>
            </div>
            <p class="text-prado-text-muted text-sm pl-5.5">{{ p.desc }}</p>
          </div>

          <div class="rounded-2xl p-5 border border-prado-border mt-4" :style="{ backgroundColor: `${brandColor ?? '#024266'}15` }">
            <p class="text-prado-text-muted text-sm leading-relaxed">
              Des cartes "mots-cles" et "complements d'info" enrichissent les echanges. Une riche bibliographie (rapports publics, referentiels, videos, emissions radio) est mise a disposition.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="h-px bg-prado-border max-w-7xl mx-auto" />

    <!-- Formats -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-2xl text-prado-text mb-8 text-center" :style="{ fontFamily: 'Poppins' }">
        Deux formats d'animation
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
        <div class="bg-prado-surface rounded-2xl p-6 border border-[#024266]/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-[#024266]/15 flex items-center justify-center">
              <Users :size="18" class="text-[#024266]" />
            </div>
            <h3 class="text-prado-text text-lg">Pro &amp; etudiants</h3>
          </div>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center gap-2 text-prado-text-muted">
              <Clock :size="14" class="text-[#024266]" /> <span>3h00</span>
            </div>
            <div class="flex items-center gap-2 text-prado-text-muted">
              <Users :size="14" class="text-[#024266]" /> <span>Jusqu'a 32 participants</span>
            </div>
          </div>
          <p class="text-prado-text-muted text-sm">
            Organisee au sein des structures, la fresque devient un puissant outil de teambuilding et d'interconnaissance, adaptee aux professionnels de l'ASE, de l'Education nationale, du secteur associatif, sportif ou culturel.
          </p>
        </div>

        <div class="bg-prado-surface rounded-2xl p-6 border border-[#FB6223]/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-[#FB6223]/15 flex items-center justify-center">
              <Users :size="18" class="text-[#FB6223]" />
            </div>
            <h3 class="text-prado-text text-lg">Grand public</h3>
          </div>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center gap-2 text-prado-text-muted">
              <Clock :size="14" class="text-[#FB6223]" /> <span>2h30</span>
            </div>
            <div class="flex items-center gap-2 text-prado-text-muted">
              <Users :size="14" class="text-[#FB6223]" /> <span>4 a 8 participants par groupe</span>
            </div>
          </div>
          <p class="text-prado-text-muted text-sm">
            Ouverte a toutes et tous lors de sessions grand public. Un moment pour apprendre, partager et imaginer ensemble de nouvelles pistes d'action, au service de la protection des enfants.
          </p>
        </div>
      </div>

      <div class="h-px bg-prado-border max-w-5xl mx-auto mb-16" />

      <!-- Sessions -->
      <h2 class="text-2xl text-prado-text mb-6 flex items-center gap-2.5" :style="{ fontFamily: 'Poppins' }">
        <Calendar :size="20" :style="{ color: brandColor }" /> Prochaines sessions
      </h2>
      <div class="space-y-3 mb-16">
        <div
          v-for="(s, i) in d.sessions"
          :key="`session-${i}`"
          class="flex flex-col sm:flex-row sm:items-center justify-between bg-prado-surface rounded-2xl p-5 border border-prado-border gap-3"
        >
          <div>
            <div class="text-prado-text">
              {{ s.date }} -- <span :style="{ color: brandColor }">{{ s.version }}</span>
            </div>
            <div class="text-sm text-prado-text-muted">{{ s.lieu }}</div>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs text-prado-text-faint flex items-center gap-1"><Clock :size="12" /> {{ s.duree }}</span>
            <span class="text-xs text-prado-text-faint flex items-center gap-1"><Users :size="12" /> {{ s.places }}</span>
            <NuxtLink to="/contact" class="px-5 py-2 rounded-full text-white text-sm transition-colors" :style="{ backgroundColor: brandColor }">
              S'inscrire
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="h-px bg-prado-border max-w-5xl mx-auto mb-16" />

      <!-- Contact -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div class="rounded-2xl p-6 border border-prado-border" :style="{ backgroundColor: `${brandColor}15` }">
          <h3 class="text-prado-text mb-3">Organiser une session sur devis</h3>
          <p class="text-sm text-prado-text-muted mb-4">
            Contactez notre equipe pour organiser une Fresque dans votre structure, association ou collectivite.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm" :style="{ color: brandColor }">
              <Mail :size="14" /> <span>itineraires@le-prado.fr</span>
            </div>
            <div class="flex items-center gap-2 text-sm" :style="{ color: brandColor }">
              <Phone :size="14" /> <span>06 15 50 80 21</span>
            </div>
          </div>
        </div>
        <div class="bg-prado-surface rounded-2xl p-6 border border-prado-border flex flex-col justify-between">
          <div>
            <h3 class="text-prado-text mb-2">Prado Itineraires</h3>
            <p class="text-sm text-prado-text-muted mb-4">
              11 rue du Pere Chevrier<br />69007 Lyon
            </p>
          </div>
          <NuxtLink to="/contact" class="inline-flex items-center justify-center px-6 py-3 rounded-full text-white text-sm transition-colors" :style="{ backgroundColor: brandColor }">
            Nous contacter
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
