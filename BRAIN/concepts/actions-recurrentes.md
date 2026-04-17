---
type: concept
updated: 2026-04-17
---

# Actions récurrentes

Feature validée lors de la visio du 1 avril 2026. Pas dans la V1 historique, **intégrée** suite aux besoins client.

## Principe

Une action récurrente = **une série** d'occurrences (ex : atelier chaque mardi pendant 8 semaines). Chaque occurrence est une ligne dans `actions` avec `is_recurring = true`, partage la série via un identifiant commun (à préciser — série_id ou parent_id).

## Gestion individuelle

- Chaque occurrence a sa propre date, sa propre capacité, ses propres inscriptions.
- **Exceptions** : possibilité d'annuler ou modifier une seule occurrence sans affecter la série.
- Archivage automatique nocturne : les occurrences passées basculent en archivé au même titre que les actions simples.

## Coût devis

Estimé **2,5 j / 1 500 €** dans le [[sources/devis-v2|Lot 4]] — le point le plus structurant fonctionnellement dans le lot espace prescripteur.

## À confirmer

- Schéma exact (`series_id`, `parent_id`, ou table `action_series` séparée) — à décider à l'implémentation.
- UI de création : formulaire "jusqu'au… / fréquence… / jours…" à la Google Calendar ?
