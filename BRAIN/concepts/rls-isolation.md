---
type: concept
updated: 2026-04-17
---

# Isolation par organisme (RLS PostgreSQL)

La **règle d'or** du projet : un prescripteur ne peut jamais voir les jeunes d'un autre [[entities/organismes|organisme]]. Garantie au niveau **base de données**, pas juste UI.

## Pourquoi RLS et pas juste filtrer dans l'API

Même en cas de bug applicatif, d'injection, ou d'erreur côté serveur, la base **refuse** une requête qui voudrait sortir du périmètre de l'utilisateur. C'est une défense en profondeur.

## Policies (vue logique)

| Table | Policy |
|---|---|
| `prescripteurs` | `SELECT own row` |
| `jeunes` | `SELECT/UPDATE/DELETE WHERE jeunes.organisme_id = current_user.organisme_id` |
| `inscriptions` | `WHERE prescripteur_id = current_user.id` (pour les créations) / même-organisme pour les lectures |

## Diagramme d'isolation

```
Organisme A (Foyer Saint-Jean)          Organisme B (MECS Lyon)
┌──────────────────────┐                ┌──────────────────────┐
│ Prescripteur A1   ── ┼──► Jeunes 1,2  │ Prescripteur B1 ──── ┼─► Jeunes 3,4
│ Prescripteur A2   ── ┼──► Jeunes 1,2  │                      │
└──────────────────────┘                └──────────────────────┘
         │                                         │
         └───────── ❌ INVISIBLE ─────────────────┘
```

## Rôle admin

L'admin (équipe Prado) passe par le **Service Role** côté serveur — bypass RLS contrôlé dans des endpoints `/api/admin/*` eux-mêmes protégés par le middleware `admin.ts` + vérif `requireAdmin`.

## Historique

- **V1 ancienne** (PRD) : les RLS isolaient par `prescripteur_id` (chaque prescripteur ne voyait que ses propres jeunes). Modèle trop restrictif — un collègue ne pouvait pas reprendre la fiche.
- **V1 actuelle** (cahier des charges v2) : isolation par `organisme_id`, les prescripteurs d'un même organisme partagent. Migration CDC v2 appliquée (commit `d566a57`).
