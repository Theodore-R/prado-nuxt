---
type: concept
updated: 2026-04-17
---

# Design system

## Palette — version actuelle (mars 2026)

Couleurs de la **nouvelle charte Fondation du Prado** (version non définitive, mise à jour fin avril 2026).

| Token | Hex | Usage |
|---|---|---|
| **Orange Prado** | `#FB6223` | Primary, boutons, liens, CTA, gradients |
| **Bleu marine Prado** | `#024266` | Accent, headers, footer, badges, gradients |
| **Vert-sauge Itinéraires** | `#93C1AF` | Secondary, éléments illustratifs, badges doux |
| **Noir Prado** | `#0D1F26` | Texte principal (clair) / fond (sombre) |
| **Blanc** | `#FFFFFF` | Fond (clair) / texte (sombre) |

### Couleurs **proscrites** (ancienne charte retirée)

Ne doivent apparaître **nulle part** sur la plateforme :
- Rose `#CF006C`
- Jaune `#FFD228`
- Violet `#C18ED8` / `#701C86`
- Ancien teal `#004657`

Source de vérité pour la recette visuelle : [[sources/tests-visuels]].

## Typographie

- **Titres** : Neulis Neue Bold (fichier local `docs/Neulis-Bold.otf`).
- **Corps** : [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts, graisses 400 / 500 / 600.
- **Style** : titres parfois en italique (ancienne identité) — à vérifier avec la charte finale.

## Thème clair / sombre

- **Clair** (défaut) — fond `#f5f5f7`, surface `#ffffff`, texte `#0D1F26` / `#024266`.
- **Sombre** — fond `#1a1a2e` (marine profond) ou `#0D1F26`, surface `#232340`, texte blanc.
- Toggle dans le header, choix mémorisé dans localStorage.

Tokens définis dans `assets/css/theme.css` : `prado-surface`, `prado-text`, `prado-border`, etc.

## Responsive

| Appareil | Breakpoint | Adaptation |
|---|---|---|
| Desktop | > 1024px | Nav horizontale, sidebars visibles, grilles multi-colonnes |
| Tablette | 768–1024px | Mise en page réduite, colonnes réorganisées |
| Mobile | < 768px | Menu hamburger, overlay, boutons plein écran |

## Composants

Arrondis généreux (`rounded-full` pour boutons, `rounded-2xl` pour cards), bordures subtiles, animations douces (200–700ms).

Bibliothèque extraite : **`@theodoreriant/prado-ui`** — AdminTable, ConfirmDialog, et 9 composants migrés (voir commits `bb41dc8`, `8b57949`).

Icônes : **Lucide Vue Next**, usage sémantique (Utilisateur → User, Actions → Calendar, Documents → Book).

## Animations

- **Reveal au scroll** — GSAP, apparition progressive des sections home.
- **Transition de panneau** — widget onboarding (glissement latéral).
- **Progression circulaire SVG** — avancement onboarding.
- **Soulignement animé** — liens de nav actifs.

## Inspiration

Le design s'inspire de **[idealco.fr](https://idealco.fr/)** pour la mise en page structurée et les choix de navigation.

## À confirmer à réception de la charte finale

- Couleurs exactes (la charte Fondation est encore préliminaire).
- Éventuelle famille typographique alternative.
- Logo définitif (actuellement : vague orange + cercles vert-sauge).
