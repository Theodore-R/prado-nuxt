# Plan : Pages statiques éditables dans Prismic + Organisation en 3 espaces

## Contexte

### État actuel
- **Prismic déjà intégré** : `@nuxtjs/prismic` dans nuxt.config.ts, repo `prado-nuxt`
- **Custom types existants** : `homepage` (singleton), `actualite`, `document`, `action`, `ressource`
- **Pages déjà Prismic** : index.vue, actualites/*, documents.vue, ressources/*, actions/*
- **Pages statiques hardcodées** :
  - `mentions-legales.vue` — 4 sections HTML (éditeur, publication, hébergement, PI)
  - `politique-confidentialite.vue` — 5 sections HTML
  - `contact.vue` — Formulaire interactif (pas de contenu éditorial)
  - `organisation.vue` — Placeholder "En construction"
  - `impact-social.vue` — Placeholder "En construction"
  - `pratiques-inspirantes.vue` — Placeholder "En construction"
  - `rapport-activite.vue` — Placeholder "En construction"
  - `fresque.vue` — Page programme : sessions, parcours de vie, objectifs, témoignages (~11KB)
  - `foodtruck.vue` — Page programme : planning tournée, menu, étapes d'inscription (~11KB)
  - `educolab.vue` — Page programme simple : texte + lien externe vers educolab.le-prado.fr

### Objectif
1. Rendre chaque page statique éditable dans Prismic
2. Organiser Prismic en 3 espaces : **Pages statiques**, **Blog**, **Ressources**

---

## Task Type
- [x] Frontend (pages Vue + composables)
- [x] Fullstack (custom types Prismic + pages Nuxt + migration contenu)

---

## Solution technique

### Architecture des custom types

Un **custom type dédié par page** quand la structure est unique, et un type **réutilisable** pour les pages qui partagent la même structure.

| Espace Prismic | Custom Type | Label affiché | Type | Pages |
|---|---|---|---|---|
| **Pages statiques** | `page_legale` | 📄 Page légale | repeatable | mentions-legales, politique-confidentialite, CGV futures… |
| **Pages statiques** | `page` | 📄 Page | repeatable | organisation, impact-social, pratiques-inspirantes, rapport-activite |
| **Pages statiques** | `fresque` | 🎨 Fresque | singleton | /fresque |
| **Pages statiques** | `foodtruck` | 🚚 Foodtruck | singleton | /foodtruck |
| **Pages statiques** | `educolab` | 📘 Educolab | singleton | /educolab |
| **Blog** | `actualite` | 📝 Blog — Actualité | repeatable (existe) | /actualites/* |
| **Ressources** | `ressource` | 📚 Ressource | repeatable (existe) | /ressources/* |
| **Ressources** | `document` | 📎 Document | repeatable (existe) | /documents |
| _(inchangé)_ | `homepage` | 🏠 Accueil | singleton (existe) | / |
| _(inchangé)_ | `action` | 🎯 Action | repeatable (existe) | /actions/* |

### Justification
- **`page_legale`** (repeatable) : mentions-legales et politique-confidentialite ont la même structure (titre + corps rich text). Réutilisable pour de futures pages légales (CGV, CGU…).
- **`page`** (repeatable) : pour les pages de contenu génériques (organisation, impact-social, etc.) avec titre + sous-titre + hero image + corps rich text.
- **`fresque`** (singleton) : structure unique — sessions avec dates/lieux/places, parcours de vie avec couleurs, objectifs avec icônes, témoignage.
- **`foodtruck`** (singleton) : structure unique — planning tournée par jours, carte menu (plats + desserts), étapes d'inscription, highlights.
- **`educolab`** (singleton) : structure simple mais spécifique — titre, description, lien externe, image.

### Routage
- `pages/mentions-legales.vue` et `pages/politique-confidentialite.vue` → fetch `page_legale` par UID
- `pages/[...slug].vue` → catch-all pour pages `page` par UID
- `pages/fresque.vue`, `pages/foodtruck.vue`, `pages/educolab.vue` → fetch singleton de leur type respectif (comme homepage)

---

## Étapes d'implémentation

### Phase 1 : Créer les nouveaux custom types

#### 1.1 — Custom type `page_legale`

**Fichier** : `customtypes/page_legale/index.json`

```json
{
  "id": "page_legale",
  "label": "📄 Page légale",
  "repeatable": true,
  "status": true,
  "json": {
    "Main": {
      "uid": { "type": "UID", "config": { "label": "URL Slug", "placeholder": "mentions-legales" } },
      "title": { "type": "Text", "config": { "label": "Titre de la page" } },
      "body": {
        "type": "StructuredText",
        "config": {
          "label": "Contenu",
          "multi": "paragraph,heading2,heading3,heading4,list-item,o-list-item,strong,em,hyperlink"
        }
      }
    },
    "SEO": {
      "meta_title": { "type": "Text", "config": { "label": "Meta Title" } },
      "meta_description": { "type": "Text", "config": { "label": "Meta Description" } }
    }
  }
}
```

#### 1.2 — Custom type `page`

**Fichier** : `customtypes/page/index.json`

```json
{
  "id": "page",
  "label": "📄 Page",
  "repeatable": true,
  "status": true,
  "json": {
    "Main": {
      "uid": { "type": "UID", "config": { "label": "URL Slug", "placeholder": "organisation" } },
      "title": { "type": "Text", "config": { "label": "Titre" } },
      "subtitle": { "type": "Text", "config": { "label": "Sous-titre (optionnel)" } },
      "hero_image": { "type": "Image", "config": { "label": "Image hero (optionnel)" } },
      "body": {
        "type": "StructuredText",
        "config": {
          "label": "Contenu",
          "multi": "paragraph,heading2,heading3,heading4,list-item,o-list-item,strong,em,hyperlink,image,embed"
        }
      }
    },
    "SEO": {
      "meta_title": { "type": "Text", "config": { "label": "Meta Title" } },
      "meta_description": { "type": "Text", "config": { "label": "Meta Description" } },
      "og_image": { "type": "Image", "config": { "label": "OG Image" } }
    }
  }
}
```

#### 1.3 — Custom type `fresque` (singleton)

**Fichier** : `customtypes/fresque/index.json`

```json
{
  "id": "fresque",
  "label": "🎨 Fresque",
  "repeatable": false,
  "status": true,
  "json": {
    "Main": {
      "surtitle": { "type": "Text", "config": { "label": "Sur-titre", "placeholder": "Atelier pédagogique et collaboratif" } },
      "title": { "type": "Text", "config": { "label": "Titre principal" } },
      "description": { "type": "Text", "config": { "label": "Description courte (hero)" } },
      "hero_image": { "type": "Image", "config": { "label": "Image hero" } },
      "brand_color": { "type": "Color", "config": { "label": "Couleur dominante" } },
      "intro_title": { "type": "Text", "config": { "label": "Titre section intro" } },
      "intro_body": { "type": "StructuredText", "config": { "label": "Texte d'introduction", "multi": "paragraph,strong,em,hyperlink" } },
      "testimonial_quote": { "type": "StructuredText", "config": { "label": "Citation témoignage", "multi": "paragraph,strong,em" } },
      "testimonial_author": { "type": "Text", "config": { "label": "Auteur témoignage" } }
    },
    "Objectifs": {
      "objectives": {
        "type": "Group",
        "config": {
          "label": "Objectifs",
          "fields": {
            "icon_name": { "type": "Select", "config": { "label": "Icône", "options": ["BookOpen", "Lightbulb", "Shield", "Users", "Heart"] } },
            "label": { "type": "Text", "config": { "label": "Libellé" } },
            "desc": { "type": "Text", "config": { "label": "Description" } }
          }
        }
      }
    },
    "Parcours": {
      "parcours": {
        "type": "Group",
        "config": {
          "label": "Parcours de vie",
          "fields": {
            "nom": { "type": "Text", "config": { "label": "Nom et âge" } },
            "desc": { "type": "Text", "config": { "label": "Description" } },
            "color": { "type": "Color", "config": { "label": "Couleur" } }
          }
        }
      }
    },
    "Sessions": {
      "sessions": {
        "type": "Group",
        "config": {
          "label": "Prochaines sessions",
          "fields": {
            "date": { "type": "Text", "config": { "label": "Date" } },
            "version": { "type": "Text", "config": { "label": "Version (Pro/Grand public)" } },
            "lieu": { "type": "Text", "config": { "label": "Lieu" } },
            "duree": { "type": "Text", "config": { "label": "Durée" } },
            "places": { "type": "Text", "config": { "label": "Places restantes" } }
          }
        }
      }
    },
    "SEO": {
      "meta_title": { "type": "Text", "config": { "label": "Meta Title" } },
      "meta_description": { "type": "Text", "config": { "label": "Meta Description" } },
      "og_image": { "type": "Image", "config": { "label": "OG Image" } }
    }
  }
}
```

#### 1.4 — Custom type `foodtruck` (singleton)

**Fichier** : `customtypes/foodtruck/index.json`

```json
{
  "id": "foodtruck",
  "label": "🚚 Foodtruck",
  "repeatable": false,
  "status": true,
  "json": {
    "Main": {
      "surtitle": { "type": "Text", "config": { "label": "Sur-titre", "placeholder": "Foodtruck solidaire" } },
      "title": { "type": "Text", "config": { "label": "Titre principal" } },
      "tagline": { "type": "Text", "config": { "label": "Accroche" } },
      "hero_image": { "type": "Image", "config": { "label": "Image hero" } },
      "brand_color": { "type": "Color", "config": { "label": "Couleur dominante" } },
      "intro_title": { "type": "Text", "config": { "label": "Titre section projet" } },
      "intro_body": { "type": "StructuredText", "config": { "label": "Description du projet", "multi": "paragraph,strong,em,hyperlink" } }
    },
    "Highlights": {
      "highlights": {
        "type": "Group",
        "config": {
          "label": "Points forts",
          "fields": {
            "icon_name": { "type": "Select", "config": { "label": "Icône", "options": ["ChefHat", "Users", "Heart", "Truck", "Utensils"] } },
            "label": { "type": "Text", "config": { "label": "Libellé" } },
            "desc": { "type": "Text", "config": { "label": "Description" } }
          }
        }
      }
    },
    "Tournee": {
      "tournee": {
        "type": "Group",
        "config": {
          "label": "Planning de tournée",
          "fields": {
            "jour": { "type": "Text", "config": { "label": "Jour" } },
            "lieu": { "type": "Text", "config": { "label": "Lieu" } },
            "precision": { "type": "Text", "config": { "label": "Précision (fréquence)" } }
          }
        }
      }
    },
    "Menu": {
      "plats": {
        "type": "Group",
        "config": {
          "label": "Plats",
          "fields": {
            "name": { "type": "Text", "config": { "label": "Nom du plat" } },
            "desc": { "type": "Text", "config": { "label": "Description / ingrédients" } }
          }
        }
      },
      "desserts": {
        "type": "Group",
        "config": {
          "label": "Desserts",
          "fields": {
            "name": { "type": "Text", "config": { "label": "Nom" } },
            "desc": { "type": "Text", "config": { "label": "Description / ingrédients" } }
          }
        }
      }
    },
    "Etapes": {
      "steps": {
        "type": "Group",
        "config": {
          "label": "Étapes d'inscription",
          "fields": {
            "step_number": { "type": "Text", "config": { "label": "Numéro", "placeholder": "01" } },
            "title": { "type": "Text", "config": { "label": "Titre" } },
            "desc": { "type": "Text", "config": { "label": "Description" } },
            "color": { "type": "Color", "config": { "label": "Couleur" } }
          }
        }
      }
    },
    "SEO": {
      "meta_title": { "type": "Text", "config": { "label": "Meta Title" } },
      "meta_description": { "type": "Text", "config": { "label": "Meta Description" } },
      "og_image": { "type": "Image", "config": { "label": "OG Image" } }
    }
  }
}
```

#### 1.5 — Custom type `educolab` (singleton)

**Fichier** : `customtypes/educolab/index.json`

```json
{
  "id": "educolab",
  "label": "📘 Educolab",
  "repeatable": false,
  "status": true,
  "json": {
    "Main": {
      "surtitle": { "type": "Text", "config": { "label": "Sur-titre", "placeholder": "Compétences parentales" } },
      "title": { "type": "Text", "config": { "label": "Titre" } },
      "hero_image": { "type": "Image", "config": { "label": "Image hero" } },
      "brand_color": { "type": "Color", "config": { "label": "Couleur dominante" } },
      "card_title": { "type": "Text", "config": { "label": "Titre de la carte" } },
      "card_body": { "type": "StructuredText", "config": { "label": "Contenu de la carte", "multi": "paragraph,strong,em,hyperlink" } },
      "cta_label": { "type": "Text", "config": { "label": "Texte du bouton" } },
      "cta_link": { "type": "Link", "config": { "label": "Lien externe" } }
    },
    "SEO": {
      "meta_title": { "type": "Text", "config": { "label": "Meta Title" } },
      "meta_description": { "type": "Text", "config": { "label": "Meta Description" } }
    }
  }
}
```

**Livrable Phase 1** : 5 custom types créés, pushés vers Prismic via Slice Machine

---

### Phase 2 : Renommer les labels des custom types existants

| Fichier | Ancien label | Nouveau label |
|---|---|---|
| `customtypes/actualite/index.json` | "Actualité" | "📝 Blog — Actualité" |
| `customtypes/ressource/index.json` | "Ressource" | "📚 Ressource" |
| `customtypes/document/index.json` | "Document" | "📎 Document" |
| `customtypes/homepage/index.json` | "Homepage" | "🏠 Accueil" |
| `customtypes/action/index.json` | "Action" | "🎯 Action" |

**Livrable** : Labels mis à jour, pushés via Slice Machine

---

### Phase 3 : Créer les composables

#### 3.1 — `composables/usePageLegale.ts`

```typescript
export const usePageLegale = (uid: string) => {
  const { client } = usePrismic()
  return useAsyncData(`page-legale-${uid}`, async () => {
    try {
      return await client.getByUID('page_legale', uid)
    } catch {
      return null
    }
  }, { server: true, dedupe: 'defer' })
}
```

#### 3.2 — `composables/useStaticPage.ts`

```typescript
export const useStaticPage = (uid: string) => {
  const { client } = usePrismic()
  return useAsyncData(`page-${uid}`, async () => {
    try {
      return await client.getByUID('page', uid)
    } catch {
      return null
    }
  }, { server: true, dedupe: 'defer' })
}
```

#### 3.3 — `composables/useFresque.ts`

```typescript
export const useFresque = () => {
  const { client } = usePrismic()
  return useAsyncData('fresque', async () => {
    try {
      return await client.getSingle('fresque')
    } catch {
      return null
    }
  }, { server: true, dedupe: 'defer' })
}
```

#### 3.4 — `composables/useFoodtruck.ts`

```typescript
export const useFoodtruck = () => {
  const { client } = usePrismic()
  return useAsyncData('foodtruck', async () => {
    try {
      return await client.getSingle('foodtruck')
    } catch {
      return null
    }
  }, { server: true, dedupe: 'defer' })
}
```

#### 3.5 — `composables/useEducolab.ts`

```typescript
export const useEducolab = () => {
  const { client } = usePrismic()
  return useAsyncData('educolab', async () => {
    try {
      return await client.getSingle('educolab')
    } catch {
      return null
    }
  }, { server: true, dedupe: 'defer' })
}
```

**Livrable** : 5 composables créés

---

### Phase 4 : Modifier les pages Vue

#### 4.1 — `pages/mentions-legales.vue` → fetch depuis `page_legale`

Remplacer le HTML hardcodé par un fetch Prismic + `<PrismicRichText>` pour le body. Garder le même layout visuel (max-w-4xl, couleurs prado-*).

#### 4.2 — `pages/politique-confidentialite.vue` → fetch depuis `page_legale`

Idem que mentions-legales.

#### 4.3 — `pages/fresque.vue` → fetch depuis singleton `fresque`

Remplacer les données hardcodées (`sessions`, `parcours`, `objectives`) par les données Prismic. Garder le template Vue identique mais alimenté par les champs Prismic au lieu des constantes JS.

#### 4.4 — `pages/foodtruck.vue` → fetch depuis singleton `foodtruck`

Remplacer les données hardcodées (`tournee`, `plats`, `desserts`, `steps`, `highlights`) par les données Prismic.

#### 4.5 — `pages/educolab.vue` → fetch depuis singleton `educolab`

Remplacer les données hardcodées par les champs Prismic.

#### 4.6 — `pages/[...slug].vue` → route catch-all pour `page`

Nouvelle route pour les pages génériques (organisation, impact-social, etc.) :
- Fetch `page` par UID
- Affiche titre + sous-titre + hero image + body rich text
- 404 si le document n'existe pas

#### 4.7 — Supprimer les pages placeholder devenues inutiles

- `pages/organisation.vue` → servie par `[...slug].vue`
- `pages/impact-social.vue` → servie par `[...slug].vue`
- `pages/pratiques-inspirantes.vue` → servie par `[...slug].vue`
- `pages/rapport-activite.vue` → servie par `[...slug].vue`

**Livrable** : Toutes les pages consomment Prismic

---

### Phase 5 : Migration du contenu vers Prismic

Script `scripts/migrate-static-pages.mjs` qui crée les documents via la Migration API :

#### Documents `page_legale`

| UID | Contenu |
|---|---|
| `mentions-legales` | 4 sections : éditeur, directeur publication, hébergement, propriété intellectuelle |
| `politique-confidentialite` | 5 sections : collecte, utilisation, conservation, droits, cookies |

#### Documents `page`

| UID | Contenu |
|---|---|
| `organisation` | Placeholder — page en construction |
| `impact-social` | Placeholder — page en construction |
| `pratiques-inspirantes` | Placeholder — page en construction |
| `rapport-activite` | Placeholder — page en construction |

#### Singletons

| Type | Contenu à migrer depuis le Vue hardcodé |
|---|---|
| `fresque` | sessions, parcours, objectifs, intro, témoignage |
| `foodtruck` | tournée, menu (plats + desserts), steps, highlights, intro |
| `educolab` | titre, description, lien externe |

**Livrable** : Tout le contenu dans Prismic, publié

---

### Phase 6 : Vérification et cache

- Ajouter des `routeRules` SWR dans `nuxt.config.ts` :
  ```typescript
  routeRules: {
    '/': { swr: 60 },
    '/mentions-legales': { swr: 3600 },
    '/politique-confidentialite': { swr: 3600 },
    '/fresque': { swr: 300 },
    '/foodtruck': { swr: 300 },
    '/educolab': { swr: 3600 },
  }
  ```
- Vérifier les URLs, SEO, et navigation interne
- Tester le rendu du rich text via `<PrismicRichText>`

**Livrable** : Tout fonctionne, cache configuré

---

## Fichiers clés

| Fichier | Opération | Description |
|---|---|---|
| `customtypes/page_legale/index.json` | Créer | Type "Page légale" (repeatable) |
| `customtypes/page/index.json` | Créer | Type "Page" générique (repeatable) |
| `customtypes/fresque/index.json` | Créer | Type "Fresque" (singleton) |
| `customtypes/foodtruck/index.json` | Créer | Type "Foodtruck" (singleton) |
| `customtypes/educolab/index.json` | Créer | Type "Educolab" (singleton) |
| `customtypes/actualite/index.json` | Modifier L3 | Label → "📝 Blog — Actualité" |
| `customtypes/ressource/index.json` | Modifier L3 | Label → "📚 Ressource" |
| `customtypes/document/index.json` | Modifier L3 | Label → "📎 Document" |
| `customtypes/homepage/index.json` | Modifier L3 | Label → "🏠 Accueil" |
| `customtypes/action/index.json` | Modifier L3 | Label → "🎯 Action" |
| `composables/usePageLegale.ts` | Créer | Composable pages légales |
| `composables/useStaticPage.ts` | Créer | Composable pages génériques |
| `composables/useFresque.ts` | Créer | Composable singleton fresque |
| `composables/useFoodtruck.ts` | Créer | Composable singleton foodtruck |
| `composables/useEducolab.ts` | Créer | Composable singleton educolab |
| `pages/mentions-legales.vue` | Modifier | Fetch Prismic au lieu de HTML hardcodé |
| `pages/politique-confidentialite.vue` | Modifier | Fetch Prismic au lieu de HTML hardcodé |
| `pages/fresque.vue` | Modifier | Fetch Prismic au lieu de constantes JS |
| `pages/foodtruck.vue` | Modifier | Fetch Prismic au lieu de constantes JS |
| `pages/educolab.vue` | Modifier | Fetch Prismic au lieu de HTML hardcodé |
| `pages/[...slug].vue` | Créer | Route catch-all pages génériques |
| `pages/organisation.vue` | Supprimer | Servie par catch-all |
| `pages/impact-social.vue` | Supprimer | Servie par catch-all |
| `pages/pratiques-inspirantes.vue` | Supprimer | Servie par catch-all |
| `pages/rapport-activite.vue` | Supprimer | Servie par catch-all |
| `scripts/migrate-static-pages.mjs` | Créer | Script migration contenu |
| `nuxt.config.ts` | Modifier | routeRules pour cache |

---

## Risques et mitigation

| Risque | Mitigation |
|---|---|
| Route catch-all `[...slug]` conflit avec routes existantes | Nuxt priorise les routes explicites — pas de conflit |
| Perte contenu hardcodé lors modification des pages | Migrer le contenu dans Prismic AVANT de modifier les pages Vue |
| Prismic rate limits sur la Migration API | Délais entre appels API dans le script |
| Champs Group dans les singletons ont des limites Prismic | Vérifier que les groupes ne dépassent pas la limite (100 items par défaut) |
| Rendu rich text différent du HTML hardcodé actuel | Utiliser `prismicSerializer.ts` existant pour personnaliser le rendu |

---

## Dashboard Prismic résultant

```
📄 Page légale          → mentions-legales, politique-confidentialite, …
📄 Page                 → organisation, impact-social, pratiques-inspirantes, rapport-activite
🎨 Fresque              → 1 document singleton
🚚 Foodtruck            → 1 document singleton
📘 Educolab             → 1 document singleton
📝 Blog — Actualité     → articles de blog
📚 Ressource            → ressources professionnelles
📎 Document             → documents PDF
🏠 Accueil              → 1 document singleton (homepage)
🎯 Action               → actions socio-éducatives
```

Les 3 espaces demandés sont visuellement identifiables dans le dashboard grâce aux emojis et au nommage.

---

## Hors scope

1. **Contact.vue** — formulaire interactif, pas du contenu éditorial Prismic
2. **Preview Prismic** — mode preview pour brouillons
3. **Slice Machine slices** — composants visuels séparés
