---
type: concept
updated: 2026-04-17
---

# Émargement des présences

Feature **admin** — pointage des présences le jour J.

## Besoin

Demandé par les financeurs (Département, État) pour justifier les actions réalisées. Auparavant géré sur papier/Excel. L'émargement numérique :
- remplace la paperasse,
- alimente directement le module statistiques (taux de participation, taux d'absentéisme),
- permet de générer la feuille de présence PDF pour les financeurs.

## Fonctionnement

1. Pour chaque action (passée ou en cours), l'admin ouvre la liste des jeunes inscrits.
2. Pour chaque inscription, coche **présent** ou **absent** (défaut : `inscrit`).
3. Le champ `presence` sur `inscriptions` passe à `present` ou `absent`.
4. Export PDF de la feuille de présence signable (avec noms, organismes, espaces de signature).

## Statistiques dérivées

- **Taux de participation** = présents / inscrits (par action, par période, par organisme).
- **Taux d'absentéisme** = absents / inscrits.
- **Fidélisation** = jeunes participant à ≥ 1, 2, 3+ actions (dédupliqué via `jeune_id`).

## Charge

Compris dans le Lot 5 — [[sources/devis-v2|gestion des inscriptions + émargement]] (1,5 j / 900 €).
