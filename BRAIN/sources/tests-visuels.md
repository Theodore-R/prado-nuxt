---
type: source
updated: 2026-04-17
source: ../../docs/tests-visuels.md
---

# Source — Tests visuels

**Document** : `docs/tests-visuels.md`
**Nature** : checklist de recette visuelle exhaustive (708 lignes).

## Cible

Chaque point à vérifier sur **3 viewports** (Desktop 1440 / Tablette 768 / Mobile 375) et **3 navigateurs** (Chrome / Safari / Firefox).

## Palette de référence (définitive pour la recette)

Tokens à valider :

| Token | Hex |
|---|---|
| Orange Prado | `#FB6223` |
| Bleu marine Prado | `#024266` |
| Vert-sauge Itinéraires | `#93C1AF` |
| Noir Prado | `#0D1F26` |
| Blanc | `#FFFFFF` |

**Couleurs proscrites** (ne doivent apparaître **nulle part**) :
- Rose `#CF006C`, Jaune `#FFD228`, Violet `#C18ED8` / `#701C86`
- Ancien teal `#004657`

Voir [[concepts/design-system]] pour les tokens en contexte.

## Structure des checks

1. Thème et couleurs globales (clair, sombre, absence de couleurs obsolètes)
2. Homepage (toutes les sections)
3. + 700 lignes de checks sur les autres pages et composants.

## Quand utiliser ce doc

- **Recette visuelle avant MEP**.
- **Revue après réception de la charte graphique finale** (fin avril 2026) pour confirmer/ajuster.
- **Régression** quand on touche le design system ou un composant partagé.
