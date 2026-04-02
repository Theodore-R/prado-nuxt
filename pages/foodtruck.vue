<script setup lang="ts">
import { MapPin, Utensils, Phone, Users, ChefHat, Heart, Truck } from 'lucide-vue-next'

const iconMap: Record<string, any> = { ChefHat, Users, Heart, Truck, Utensils }

const { data: page } = await useFoodtruck()
const d = computed(() => page.value?.data)

useHead({
  title: d.value?.meta_title || 'Les Saveurs d\'Elise - Foodtruck solidaire | Prado Itineraires',
  meta: d.value?.meta_description
    ? [{ name: 'description', content: d.value.meta_description }]
    : [],
})

const brandColor = computed(() => d.value?.brand_color || '#FB6223')
</script>

<template>
  <div v-if="d">
    <!-- Hero -->
    <div class="relative h-[50vh] min-h-[380px] flex items-end">
      <div class="absolute inset-0">
        <PrismicImage v-if="d.hero_image?.url" :field="d.hero_image" class="w-full h-full object-cover" />
        <ImageWithFallback v-else src="/images/foodtruck.png" alt="Les Saveurs d'Elise - Foodtruck solidaire" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-prado-bg via-prado-bg/70 to-transparent" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
        <p class="text-sm mb-3 tracking-widest uppercase" :style="{ color: brandColor }">{{ d.surtitle }}</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl text-prado-text mb-3" :style="{ fontFamily: 'Poppins', lineHeight: 1.1 }">
          {{ d.title }}
        </h1>
        <p class="text-prado-text-muted text-lg md:text-xl max-w-lg">{{ d.tagline }}</p>
      </div>
    </div>

    <!-- Presentation -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        <div class="lg:col-span-3 space-y-6">
          <h2 class="text-2xl md:text-3xl text-prado-text" :style="{ fontFamily: 'Poppins' }">{{ d.intro_title }}</h2>
          <div class="text-prado-text-muted leading-relaxed text-base">
            <PrismicRichText :field="d.intro_body" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div v-for="(item, i) in d.highlights" :key="item.label ?? i" class="bg-prado-surface rounded-2xl p-5 border border-prado-border">
              <component :is="iconMap[item.icon_name ?? ''] || ChefHat" :size="22" class="mb-3" :style="{ color: brandColor }" />
              <div class="text-prado-text text-sm mb-1">{{ item.label }}</div>
              <div class="text-prado-text-muted text-xs">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 rounded-2xl overflow-hidden">
          <ImageWithFallback src="/images/foodtruck-cuisine.png" alt="Jeunes en stage cuisine dans le foodtruck" class="w-full h-full object-cover aspect-[4/5]" />
        </div>
      </div>
    </div>

    <div class="h-px bg-prado-border max-w-7xl mx-auto" />

    <!-- Menu + Tournee -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Menu du mois -->
        <div>
          <h2 class="text-2xl text-prado-text mb-2 flex items-center gap-2.5" :style="{ fontFamily: 'Poppins' }">
            <Utensils :size="22" :style="{ color: brandColor }" /> {{ d.menu_title || 'Menu du mois' }}
          </h2>
          <p class="text-prado-text-muted text-sm mb-6">{{ d.menu_subtitle || 'Menu de saison, a prix reduit. Mis a jour chaque mois.' }}</p>

          <div class="bg-prado-surface rounded-2xl border border-prado-border p-6 space-y-5">
            <p v-if="d.menu_quote" class="text-center text-prado-text-secondary italic text-sm mb-4">"{{ d.menu_quote }}"</p>

            <div v-if="d.entrees?.length">
              <h4 class="text-xs uppercase tracking-wider mb-2" :style="{ color: brandColor }">Entree</h4>
              <div class="space-y-2">
                <div v-for="(e, i) in d.entrees" :key="e.name ?? i" class="bg-prado-bg rounded-xl p-3">
                  <p class="text-prado-text text-sm">{{ e.name }}</p>
                  <p v-if="e.desc" class="text-prado-text-faint text-xs">{{ e.desc }}</p>
                </div>
              </div>
            </div>

            <div v-if="d.plats?.length">
              <h4 class="text-xs uppercase tracking-wider mb-2" :style="{ color: brandColor }">Plats</h4>
              <div class="space-y-2">
                <div v-for="(p, i) in d.plats" :key="p.name ?? i" class="bg-prado-bg rounded-xl p-3">
                  <p class="text-prado-text text-sm">{{ p.name }}</p>
                  <p v-if="p.desc" class="text-prado-text-faint text-xs">{{ p.desc }}</p>
                </div>
              </div>
            </div>

            <div v-if="d.desserts?.length">
              <h4 class="text-xs uppercase tracking-wider mb-2" :style="{ color: brandColor }">Desserts</h4>
              <div class="space-y-2">
                <div v-for="(dessert, i) in d.desserts" :key="dessert.name ?? i" class="bg-prado-bg rounded-xl p-3">
                  <p class="text-prado-text text-sm">{{ dessert.name }}</p>
                  <p v-if="dessert.desc" class="text-prado-text-faint text-xs">{{ dessert.desc }}</p>
                </div>
              </div>
            </div>

            <div class="border-t border-prado-border pt-4">
              <h4 class="text-xs uppercase tracking-wider text-[var(--prado-signature-accent)] mb-3">Tarifs</h4>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-prado-bg rounded-xl p-4 text-center">
                  <p class="text-[var(--prado-signature-accent)] text-xs uppercase tracking-wider mb-1">Prix solidaire</p>
                  <div class="space-y-1 text-sm">
                    <p class="text-prado-text">Menu : <span :style="{ color: brandColor }">{{ d.prix_solidaire_menu || '9' }}</span></p>
                    <p class="text-prado-text">Plat seul : <span :style="{ color: brandColor }">{{ d.prix_solidaire_plat || '6' }}</span></p>
                    <p class="text-prado-text">Dessert/Entree : <span :style="{ color: brandColor }">{{ d.prix_solidaire_dessert || '3' }}</span></p>
                  </div>
                </div>
                <div class="bg-prado-bg rounded-xl p-4 text-center">
                  <p class="text-prado-text-muted text-xs uppercase tracking-wider mb-1">Tarif normal</p>
                  <div class="space-y-1 text-sm">
                    <p class="text-prado-text">Menu : <span :style="{ color: brandColor }">{{ d.prix_normal_menu || '13' }}</span></p>
                    <p class="text-prado-text">Plat : <span :style="{ color: brandColor }">{{ d.prix_normal_plat || '8' }}</span></p>
                    <p class="text-prado-text">Dessert/Entree : <span :style="{ color: brandColor }">{{ d.prix_normal_dessert || '3' }}</span></p>
                  </div>
                </div>
              </div>
              <p class="text-prado-text-faint text-xs text-center mt-3">{{ d.tarif_note || 'Boisson gratuite et a volonte' }}</p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-[#FB6223]/10 to-[#FB6223]/5 rounded-2xl p-5 border border-prado-border mt-6 flex items-start gap-4">
            <Phone :size="18" class="mt-0.5 shrink-0" :style="{ color: brandColor }" />
            <div>
              <p class="text-prado-text text-sm mb-1">{{ d.phone_label || 'Renseignements menus & tournees' }}</p>
              <p class="text-prado-text-muted text-sm">{{ d.phone_numbers || '06 24 68 52 04 / 06 81 44 37 13' }}</p>
            </div>
          </div>
        </div>

        <!-- Info tournee -->
        <div>
          <h2 class="text-2xl text-prado-text mb-2 flex items-center gap-2.5" :style="{ fontFamily: 'Poppins' }">
            <MapPin :size="22" class="text-[var(--prado-signature-accent)]" /> Info tournee
          </h2>
          <p class="text-prado-text-muted text-sm mb-6">A partir de septembre 2025</p>

          <div class="space-y-4">
            <div v-for="(t, i) in d.tournee" :key="t.jour ?? i" class="bg-prado-surface rounded-2xl border border-prado-border p-5">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-3 py-1 rounded-full bg-[var(--prado-signature)]/15 text-[var(--prado-signature-accent)] text-xs font-medium">{{ t.jour }}</span>
              </div>
              <div class="space-y-2.5">
                <div class="flex items-start gap-3 text-sm">
                  <span class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: brandColor }" />
                  <div>
                    <span class="text-prado-text">{{ t.lieu }}</span>
                    <span v-if="t.precision" class="text-prado-text-faint ml-2">-- {{ t.precision }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="h-px bg-prado-border max-w-7xl mx-auto" />

    <!-- Modalites -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <h2 class="text-2xl md:text-3xl text-prado-text mb-3 text-center" :style="{ fontFamily: 'Poppins' }">
        Modalites d'inscription
      </h2>
      <p class="text-prado-text-muted text-center max-w-2xl mx-auto mb-10">
        L'inscription au stage foodtruck se fait via un prescripteur (educateur, referent, conseiller mission locale...).
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div v-for="(s, i) in d.steps" :key="s.step_number ?? i" class="bg-prado-surface rounded-2xl p-6 border border-prado-border text-center">
          <div class="text-3xl mb-4" :style="{ color: s.color ?? brandColor, fontFamily: 'Poppins' }">{{ s.step_number }}</div>
          <h3 class="text-prado-text text-sm mb-2">{{ s.title }}</h3>
          <p class="text-prado-text-muted text-xs leading-relaxed">{{ s.desc }}</p>
        </div>
      </div>

      <div class="text-center mt-10 flex flex-wrap justify-center gap-4">
        <NuxtLink to="/contact" class="px-8 py-3.5 rounded-full text-white transition-colors" :style="{ backgroundColor: brandColor }">
          Nous contacter
        </NuxtLink>
        <a href="tel:0624685204" class="px-8 py-3.5 rounded-full border border-prado-border-medium text-prado-text hover:bg-prado-surface-hover transition-colors flex items-center gap-2">
          <Phone :size="16" /> 06 24 68 52 04
        </a>
      </div>
    </div>
  </div>
</template>
