---
type: source
updated: 2026-04-17
source: ../../docs/session-handoff-prompt.md
---

# Source — Prompt de reprise refonte homepage

**Document** : `docs/session-handoff-prompt.md`
**Rôle** : prompt destiné à une nouvelle session Claude Code pour implémenter la refonte de la homepage.

## Contexte utile

- **Migration React → Nuxt 3** déjà effectuée (16 pages/layouts portés).
- **Prismic** : 142 actions + 187 ressources avec descriptions enrichies scrapées de l'ancien site.
- **Images locales** dans `public/images/` (94 actions + 183 ressources).
- **Admin** : dashboard, prescripteurs, inscriptions déjà en place.

## Structure homepage (10 sections)

Tranchées avec l'utilisateur section par section :

1. HERO — `UiScrollExpandHero` (déjà présent) à peupler.
2. 4 programmes — à choisir parmi Bento Grid / Cards+tabs / Accordion / Full-width stacked.
3. Nos missions — two-column / timeline / cards.
4. Chiffres d'impact — counter band gradient / floating cards / circular progress.
5. Comment ça marche — stepper / animated SVG / vertical timeline.
6. Témoignages — carousel / masonry / quote spotlight.
7. FAQ — accordion / two-column / cards grid.
8. Partenaires — infinite scroll / static grid / logo cloud.
9. En savoir plus — 4 cards horizontales.
10. CTA final — gradient band.

## Approche

Section par section : proposer 3 options visuelles → l'utilisateur choisit → implémenter → vérifier browser → commit → section suivante. Format de commit : `feat: homepage section X — [nom]`.

## Fichiers clés cités

- `pages/index.vue` — home à réécrire.
- `docs/homepage-content-spec.md` — voir [[sources/homepage-content-spec]].
- `layouts/default.vue`, `composables/useAuth.ts`, `composables/useImages.ts`.
- `constants/categories.ts`, `assets/css/theme.css`.

## Note

Le prompt mentionne des chemins absolus `/Users/theodoreriant/…` — le working directory actuel est `/Users/theodore/Documents/prado-nuxt` (pas le même user). Adapter au besoin.
