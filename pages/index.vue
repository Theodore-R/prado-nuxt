<script setup lang="ts">
const { data: homepage } = await useHomepage()

const HERO_IMAGE = '/images/hero-jeunes.jpg'

function findSlice(type: string) {
  return homepage.value?.data?.body?.find((s: any) => s.slice_type === type) ?? null
}
</script>

<template>
  <div>
    <!-- Section 1 — Hero (remonte derrière la navbar) -->
    <div id="hero" class="-mt-16">
      <UiScrollExpandHero
        media-type="image"
        :media-src="HERO_IMAGE"
        title-line1="L'innovation sociale"
        title-line2="au service"
        :title-line2-rotating="['des jeunes', 'des familles']"
        :highlight-line="1"
        subtitle="Prado Itinéraires"
        scroll-hint="Scrollez pour découvrir"
      >
        <HomeHeroContent :data="findSlice('hero')" />
      </UiScrollExpandHero>
    </div>

    <!-- Section 2 — Les Programmes -->
    <div id="programmes">
      <HomeProgrammes :data="findSlice('programmes')" />
    </div>

    <!-- Section 3 — Nos missions -->
    <div id="missions">
      <HomeMissions :data="findSlice('missions')" />
    </div>

    <!-- Section 4 — Chiffres d'impact -->
    <div id="impact">
      <HomeImpact :data="findSlice('impact')" />
    </div>

    <!-- Section 5 — Comment ça marche -->
    <div id="etapes">
      <HomeSteps :data="findSlice('steps')" />
    </div>

    <!-- Section 6 — Témoignages -->
    <div id="temoignages">
      <HomeTestimonials :data="findSlice('testimonials')" />
    </div>

    <!-- Section 7 — FAQ -->
    <div id="faq">
      <HomeFaq :data="findSlice('faq')" />
    </div>

    <!-- Newsletter -->
    <div id="newsletter">
      <HomeNewsletter />
    </div>

    <!-- Section 8 — Partenaires -->
    <div id="partenaires">
      <HomePartenaires :data="findSlice('partners')" />
    </div>

    <!-- Section 9 — En savoir plus -->
    <div id="en-savoir-plus">
      <HomeEnSavoirPlus :data="findSlice('en_savoir_plus')" />
    </div>

    <!-- Section 10 — CTA Final -->
    <div id="cta">
      <HomeCtaFinal :data="findSlice('cta_final')" />
    </div>
  </div>
</template>
