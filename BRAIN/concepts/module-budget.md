---
type: concept
updated: 2026-04-17
---

# Module budget (admin, confidentiel)

Feature demandée par le client le 1 avril 2026 : suivi financier des actions et ventilation par organisme pour les rapports aux financeurs.

## Règles métier

### Coût par action

- Champ `cost` sur `actions`, renseigné **manuellement** à la création/modification de l'action.
- Coût **total** de l'action (pas coût par jeune).

### Ventilation par organisme — règle d'or

> Chaque organisme ayant **au moins un jeune inscrit** à une action se voit imputer le **coût total** de l'action.

Exemple : atelier à 300 € avec jeunes de 2 organismes → **chaque organisme comptabilise 300 €**, pas 150 €. Logique : l'action coûte le même prix qu'il y ait 1 ou 6 jeunes.

### Filtres et agrégations

- Filtre par **année** (récapitulatif année par année).
- **Total global** = somme des coûts des actions réalisées sur l'année.
- **Prix moyen** d'une action = moyenne sur l'ensemble des actions.
- **Récapitulatif par organisme** : total des coûts imputés, filtrable.

## Confidentialité

Module **admin uniquement**. Non visible aux prescripteurs. Route `/admin/budget` ou équivalent, protégée par `admin.ts` middleware.

## Charge

Lot 5 du devis, estimé **1 j / 600 €**. Voir [[sources/devis-v2]].

## Points à clarifier

Questions ouvertes identifiées en préparation visio (cf. [[sources/prep-visio-2026-04-01]] §3) :
- Année civile ou scolaire ?
- Actions passées uniquement ou aussi planifiées ?

Réponse client consolidée dans le cahier des charges v2 : **par année** (sans précision civile/scolaire — par défaut année civile).
