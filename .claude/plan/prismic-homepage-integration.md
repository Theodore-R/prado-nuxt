# Plan d'implémentation : Intégration Prismic Homepage

## Contexte

La page d'accueil du projet Prado Nuxt contient 10 sections **100% hardcodées**. Prismic est déjà intégré et fonctionne pour les pages actions/ressources. L'objectif est de rendre chaque section entièrement éditable depuis le dashboard Prismic tout en préservant les animations (GSAP, CSS keyframes) et l'UX existante.

## Task Type
- [x] Frontend (composants Vue, animations)
- [x] Backend (data fetching, SSR, caching)
- [x] Fullstack (Prismic content model + Nuxt integration)

---

## Solution technique

### Architecture retenue : Single Type "homepage" + Slice Zone

**Consensus Codex/Gemini** : Les deux modèles recommandent un Single Type avec Slice Zone plutôt qu'un document à champs plats ou des documents séparés.

**Avantages :**
- Chaque section = 1 slice réutilisable et indépendant
- Les éditeurs peuvent réordonner les sections dans Prismic
- Séparation nette des contenus par section
- Scalable : ajout de nouvelles sections sans modifier le modèle

**Composable centralisé** `useHomepage()` (recommandation Codex, enrichie) :
- Fetch unique SSR via `useAsyncData`
- Normalisation des slices vers un objet typé
- Fallback sur données hardcodées si Prismic indisponible
- Caching SSR via Nitro `routeRules`

---

## Étapes d'implémentation

### Étape 1 — Créer le Custom Type "homepage" dans Prismic

**Livrable** : `customtypes/homepage/index.json`

Type : **Single** (non-repeatable, un seul document homepage)

**Tabs :**

| Tab | Contenu |
|-----|---------|
| SEO | `meta_title` (Key Text), `meta_description` (Key Text), `og_image` (Image) |
| Body | Slice Zone `body` avec les 10 slices ci-dessous |

---

### Étape 2 — Définir les 10 Slices

#### 2.1 `hero` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `surtitle` | Key Text | "Association de la Fondation du Prado" |
| Primary | `title` | Rich Text | Labels custom : `highlight-pink`, `highlight-orange` pour les `<span>` colorés |
| Primary | `description` | Rich Text | Avec bold, italic |
| Primary | `cta_primary_label` | Key Text | "Découvrir les actions" |
| Primary | `cta_primary_link` | Link | /actions |
| Primary | `cta_secondary_label` | Key Text | "Inscrire un jeune" |
| Primary | `cta_secondary_link` | Link | /connexion?mode=register |

#### 2.2 `programmes` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | Optionnel |
| Items | `slug` | Key Text | ID pour ancre : 'jeunes', 'foodtruck', etc. |
| Items | `title` | Key Text | Titre complet |
| Items | `short_title` | Key Text | Titre sidebar sticky |
| Items | `icon_name` | Select | Options: Users, UtensilsCrossed, HeartHandshake, Puzzle |
| Items | `brand_color` | Color | Ex: #CF006C |
| Items | `description` | Rich Text | Multi-paragraphes |
| Items | `cta_1_label` | Key Text | |
| Items | `cta_1_link` | Link | |
| Items | `cta_2_label` | Key Text | Optionnel |
| Items | `cta_2_link` | Link | Optionnel |

#### 2.3 `missions` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Primary | `intro_text` | Rich Text | Paragraphe d'introduction |
| Primary | `jeunes_title` | Key Text | "Pour les jeunes" |
| Primary | `familles_title` | Key Text | "Pour les familles" |
| Items | `category` | Select | Options: jeunes, familles |
| Items | `icon_name` | Select | Options: Users, Heart |
| Items | `text` | Key Text | Texte de la mission |

#### 2.4 `impact` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Items | `value` | Number | Valeur numérique (89, 183, 500, 50) |
| Items | `suffix` | Key Text | "+", "", etc. |
| Items | `label` | Key Text | Description du stat |
| Items | `color` | Color | Couleur du gradient |

#### 2.5 `steps` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Primary | `cta_label` | Key Text | "Créer mon compte" |
| Primary | `cta_link` | Link | /connexion?mode=register |
| Primary | `reassurance_text` | Key Text | "Gratuit · Sans engagement · Réservé aux professionnels" |
| Items | `step_number` | Key Text | "1", "2", "3" |
| Items | `title` | Key Text | |
| Items | `description` | Key Text | |

#### 2.6 `testimonials` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Items | `quote` | Rich Text | Citation complète |
| Items | `author_name` | Key Text | "Marie D." |
| Items | `author_role` | Key Text | "Éducatrice spécialisée" |
| Items | `author_org` | Key Text | "Maison d'enfants" |

#### 2.7 `faq` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Items | `question` | Key Text | |
| Items | `answer` | Rich Text | Avec liens possibles |

#### 2.8 `partners` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Items | `name` | Key Text | Nom du partenaire |
| Items | `logo` | Image | PNG fond transparent recommandé |
| Items | `url` | Link | Site web du partenaire |

#### 2.9 `en_savoir_plus` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `section_title` | Key Text | |
| Items | `title` | Key Text | |
| Items | `description` | Key Text | |
| Items | `cta_label` | Key Text | |
| Items | `link` | Link | Lien interne |

#### 2.10 `cta_final` Slice

| Zone | Champ | Type | Notes |
|------|-------|------|-------|
| Primary | `title` | Key Text | |
| Primary | `description` | Rich Text | |
| Primary | `cta_primary_label` | Key Text | |
| Primary | `cta_primary_link` | Link | |
| Primary | `cta_secondary_label` | Key Text | |
| Primary | `cta_secondary_link` | Link | |

---

### Étape 3 — Créer les utilitaires

#### 3.1 Rich Text Serializer (`utils/prismicSerializer.ts`)

Gère les labels custom pour les `<span>` colorés du hero :

```ts
// utils/prismicSerializer.ts
import { type HTMLRichTextMapSerializer } from '@prismicio/client'

export const richTextSerializer: HTMLRichTextMapSerializer = {
  label: ({ node, children }) => {
    const labelMap: Record<string, string> = {
      'highlight-pink': 'text-[#CF006C]',
      'highlight-orange': 'text-[#FB6223]',
      'highlight-purple': 'text-[#C18ED8]',
      'highlight-green': 'text-[#93C1AF]',
    }
    const className = labelMap[node.data.label ?? ''] ?? ''
    return `<span class="${className}">${children}</span>`
  },
}
```

#### 3.2 Icon Map (`utils/iconMap.ts`)

Mapping des noms Prismic vers les composants Lucide :

```ts
// utils/iconMap.ts
import { Users, UtensilsCrossed, HeartHandshake, Puzzle, Heart } from 'lucide-vue-next'

export const iconMap: Record<string, Component> = {
  Users,
  UtensilsCrossed,
  HeartHandshake,
  Puzzle,
  Heart,
}
```

#### 3.3 Données de fallback (`utils/homepageFallback.ts`)

Extraire les données hardcodées actuelles dans un objet de fallback structuré :

```ts
// utils/homepageFallback.ts
export const fallbackHomepage: NormalizedHomepage = {
  hero: { /* données actuelles de HomeHeroContent */ },
  programmes: { /* données actuelles de HomeProgrammes */ },
  missions: { /* données actuelles de HomeMissions */ },
  impact: { /* données actuelles de HomeImpact */ },
  steps: { /* données actuelles de HomeSteps */ },
  testimonials: { /* données actuelles de HomeTestimonials */ },
  faq: { /* données actuelles de HomeFaq */ },
  partners: { /* données actuelles de HomePartenaires */ },
  enSavoirPlus: { /* données actuelles de HomeEnSavoirPlus */ },
  ctaFinal: { /* données actuelles de HomeCtaFinal */ },
}
```

---

### Étape 4 — Créer le composable `useHomepage()`

```ts
// composables/useHomepage.ts
import type { Content } from '@prismicio/client'
import { fallbackHomepage } from '~/utils/homepageFallback'

interface NormalizedHomepage {
  hero: HeroData | null
  programmes: ProgrammesData | null
  missions: MissionsData | null
  impact: ImpactData | null
  steps: StepsData | null
  testimonials: TestimonialsData | null
  faq: FaqData | null
  partners: PartnersData | null
  enSavoirPlus: EnSavoirPlusData | null
  ctaFinal: CtaFinalData | null
}

export const useHomepage = () => {
  const { client } = usePrismic()

  return useAsyncData('homepage', async () => {
    try {
      const doc = await client.getSingle('homepage')
      return normalizeHomepage(doc)
    } catch (err) {
      console.error('[useHomepage] Prismic fetch failed, using fallback', err)
      return fallbackHomepage
    }
  }, {
    server: true,
    lazy: false,
    dedupe: 'defer',
  })
}

function normalizeHomepage(doc: Content.HomepageDocument): NormalizedHomepage {
  const slices = doc.data.body ?? []

  const findSlice = <T extends string>(type: T) =>
    slices.find(s => s.slice_type === type) ?? null

  return {
    hero: findSlice('hero'),
    programmes: findSlice('programmes'),
    missions: findSlice('missions'),
    impact: findSlice('impact'),
    steps: findSlice('steps'),
    testimonials: findSlice('testimonials'),
    faq: findSlice('faq'),
    partners: findSlice('partners'),
    enSavoirPlus: findSlice('en_savoir_plus'),
    ctaFinal: findSlice('cta_final'),
  }
}
```

---

### Étape 5 — Mettre à jour `pages/index.vue`

```vue
<script setup lang="ts">
const { data: homepage } = await useHomepage()
</script>

<template>
  <div>
    <UiScrollExpandHero>
      <HomeHeroContent :data="homepage?.hero" />
    </UiScrollExpandHero>
    <HomeProgrammes :data="homepage?.programmes" />
    <HomeMissions :data="homepage?.missions" />
    <HomeImpact :data="homepage?.impact" />
    <HomeSteps :data="homepage?.steps" />
    <HomeTestimonials :data="homepage?.testimonials" />
    <HomeFaq :data="homepage?.faq" />
    <HomePartenaires :data="homepage?.partners" />
    <HomeEnSavoirPlus :data="homepage?.enSavoirPlus" />
    <HomeCtaFinal :data="homepage?.ctaFinal" />
  </div>
</template>
```

---

### Étape 6 — Migrer chaque composant Home

**Principe chirurgical** : on ne change PAS la structure HTML/CSS, on remplace uniquement la source de données.

#### 6.1 `HomeHeroContent.vue`
- Ajouter prop `data` (slice hero)
- Remplacer textes hardcodés par `PrismicRichText` avec `richTextSerializer`
- Animations `hero-reveal` inchangées (elles s'appliquent au DOM qui reste identique)

#### 6.2 `HomeProgrammes.vue`
- Ajouter prop `data` (slice programmes)
- `computed programmes` mappe `data.items` vers l'interface interne
- Utiliser `iconMap[item.icon_name]` pour résoudre les icônes
- Utiliser `item.brand_color` pour les styles dynamiques
- Logique sticky scroll + intersection observer **inchangée** (opère sur le DOM rendu)

#### 6.3 `HomeMissions.vue`
- Ajouter prop `data` (slice missions)
- Filtrer `data.items` par `category === 'jeunes'` et `category === 'familles'`
- `PrismicRichText` pour l'intro

#### 6.4 `HomeImpact.vue`
- Ajouter prop `data` (slice impact)
- GSAP `animateCounters` prend `data.items[].value` au lieu des constantes
- Guard : `if (!data?.items?.length) return` pour la sécurité

#### 6.5 `HomeSteps.vue`
- Ajouter prop `data` (slice steps)
- Itérer `data.items` au lieu du tableau hardcodé

#### 6.6 `HomeTestimonials.vue`
- Ajouter prop `data` (slice testimonials)
- Distribution en colonnes : `data.items` → `firstColumn`, `secondColumn`, etc.
- Duplication pour infinite scroll : `[...items, ...items]`
- CSS keyframes `scroll-up` **inchangés**

#### 6.7 `HomeFaq.vue`
- Ajouter prop `data` (slice faq)
- `PrismicRichText` pour les réponses
- Accordion grid-rows transition **inchangé**

#### 6.8 `HomePartenaires.vue`
- Ajouter prop `data` (slice partners)
- `PrismicImage` pour les logos (imgix auto-optimisé)
- Duplication seamless : `[...data.items, ...data.items]`
- CSS keyframes `scroll-left` **inchangés**
- Filtre `brightness-0 invert` conservé pour logos blancs

#### 6.9 `HomeEnSavoirPlus.vue`
- Ajouter prop `data` (slice en_savoir_plus)
- `asLink()` de @prismicio/client pour résoudre les liens

#### 6.10 `HomeCtaFinal.vue`
- Ajouter prop `data` (slice cta_final)
- Gradient pink-to-orange **inchangé** (CSS pur)

---

### Étape 7 — Types TypeScript

Installer et configurer `prismic-ts-codegen` pour générer automatiquement les types :

```bash
npx prismic-ts-codegen init
npx prismic-ts-codegen
```

Cela génère `prismicio-types.d.ts` avec les interfaces pour chaque Custom Type et Slice.

Types additionnels manuels pour la normalisation :

```ts
// types/homepage.ts
export interface NormalizedHomepage {
  hero: Content.HeroSlice | null
  programmes: Content.ProgrammesSlice | null
  missions: Content.MissionsSlice | null
  impact: Content.ImpactSlice | null
  steps: Content.StepsSlice | null
  testimonials: Content.TestimonialsSlice | null
  faq: Content.FaqSlice | null
  partners: Content.PartnersSlice | null
  enSavoirPlus: Content.EnSavoirPlusSlice | null
  ctaFinal: Content.CtaFinalSlice | null
}
```

---

### Étape 8 — Caching SSR

Ajouter dans `nuxt.config.ts` :

```ts
routeRules: {
  '/': { swr: 60 }, // Cache SSR 60 secondes, revalidation en background
}
```

---

### Étape 9 — Peupler Prismic avec le contenu actuel

1. Créer le document `homepage` dans Prismic
2. Ajouter chaque slice avec le contenu hardcodé actuel
3. Pour le hero : utiliser les labels `highlight-pink` / `highlight-orange` sur les mots colorés
4. Pour les programmes : remplir les 4 items avec couleurs hex, icônes, textes
5. Pour les partenaires : uploader les 7 logos PNG depuis `public/images/partenaires/`
6. Publier le document

**Option automatisée** : script de migration via Prismic Migration API utilisant le write token existant (cf. memory `reference_prismic_write_token.md`).

---

### Étape 10 — Validation & Tests

1. Vérifier que chaque section rend identiquement à l'état actuel
2. Tester les animations :
   - Hero : staggered reveal au scroll
   - Impact : GSAP counter animation
   - Testimonials : infinite scroll vertical
   - Partners : infinite scroll horizontal
   - FAQ : accordion expand/collapse
3. Tester le fallback : couper Prismic → vérifier que les données hardcodées s'affichent
4. Tester SSR : `nuxt generate` ou `nuxt build && nuxt preview`
5. Tester responsive : mobile, tablette, desktop
6. Tester l'édition : modifier un champ dans Prismic → vérifier le rendu après publish

---

## Fichiers clés

| Fichier | Opération | Description |
|---------|-----------|-------------|
| `customtypes/homepage/index.json` | Créer | Custom Type Single pour la homepage |
| `slices/Hero/index.vue` | Créer | Composant slice (optionnel si on garde les Home*) |
| `utils/prismicSerializer.ts` | Créer | Serializer Rich Text avec labels colorés |
| `utils/iconMap.ts` | Créer | Mapping noms → composants Lucide |
| `utils/homepageFallback.ts` | Créer | Données de fallback extraites du hardcodé |
| `composables/useHomepage.ts` | Créer | Composable central de fetch + normalisation |
| `types/homepage.ts` | Créer | Types TypeScript pour la homepage normalisée |
| `pages/index.vue` | Modifier | Utiliser useHomepage() et passer les props |
| `components/home/HomeHeroContent.vue` | Modifier | Accepter prop `data`, utiliser PrismicRichText |
| `components/home/HomeProgrammes.vue` | Modifier | Accepter prop `data`, mapper items dynamiques |
| `components/home/HomeMissions.vue` | Modifier | Accepter prop `data`, filtrer par catégorie |
| `components/home/HomeImpact.vue` | Modifier | Accepter prop `data`, GSAP sur items dynamiques |
| `components/home/HomeSteps.vue` | Modifier | Accepter prop `data`, itérer items |
| `components/home/HomeTestimonials.vue` | Modifier | Accepter prop `data`, distribution colonnes |
| `components/home/HomeFaq.vue` | Modifier | Accepter prop `data`, PrismicRichText réponses |
| `components/home/HomePartenaires.vue` | Modifier | Accepter prop `data`, PrismicImage logos |
| `components/home/HomeEnSavoirPlus.vue` | Modifier | Accepter prop `data`, asLink() |
| `components/home/HomeCtaFinal.vue` | Modifier | Accepter prop `data` |
| `nuxt.config.ts` | Modifier | Ajouter routeRules swr caching |

---

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Prismic down → page blanche | Fallback `homepageFallback.ts` avec données hardcodées |
| Rich Text ne reproduit pas le style inline | Labels custom Prismic + serializer dédié |
| GSAP animations cassées avec données dynamiques | Guard `if (!data?.items?.length) return` + watch sur data |
| Infinite scroll casse avec nombre d'items différent | Toujours dupliquer `[...items, ...items]` |
| Éditeur supprime accidentellement tout le contenu | Prismic a un historique de versions + fallback |
| Images partenaires non optimisées | PrismicImage avec imgix auto-compress |
| SSR hydration mismatch | `useAsyncData` côté serveur avec `dedupe: 'defer'` |

---

## SESSION_ID (pour /ccg:execute)
- CODEX_SESSION: 019d20d9-97a9-7091-9bde-0caca20157c5
- GEMINI_SESSION: efb056fe-e779-4fec-b78b-3cff9509a509
