---
type: concept
updated: 2026-04-17
status: retiré
---

# Hébergement HDS — note historique

Exigence **retirée** le 1 avril 2026 (cf. [[sources/echange-client-2026-04-01]]).

## Contexte d'origine

La PRD interne prévoyait de collecter des **données de santé** sur les jeunes (allergies, handicap, suivi psychologique, suivi médical, traitements, médecin traitant, mesures de protection). L'article L.1111-8 du Code de la Santé Publique impose l'hébergement de ces données chez un **hébergeur certifié HDS**.

Un plan de migration était prévu :
- Séparation : identité dans Supabase, données santé sur base HDS (OVH Healthcare / Scaleway HDS / Clever Cloud HDS).
- Chiffrement AES-256 au repos.
- API dédiée via `server/utils/hds-client.ts`.
- RLS et journalisation stricte.
- Coût estimé : 30–50 €/mois supplémentaires.

## Décision client (1 avril 2026)

> « Peut-on remplacer le terme 'fiche santé' par 'fiche jeune' car nous n'avons aucun détail de santé hormis le fait qu'un jeune peut être orienté via une structure exerçant dans le champ du handicap. Pas besoin de fiche santé ni situation familiale. »

→ suppression pure et simple des tables `jeune_sante` et `jeune_famille` du scope V1. La présence d'un handicap est capturée uniquement comme **case à cocher dans `accompagnement_type`**, sans détail médical — pas une donnée de santé au sens HDS.

## Conséquences

- Pas d'hébergeur HDS nécessaire.
- Architecture simplifiée, pas de duplication ni de chiffrement applicatif.
- Économie récurrente pour le client (~30–50 €/mois).
- Économie dev : code préparé (`hds-client.ts`) à supprimer / nettoyer.

## Si le besoin revient

Si un programme (Foodtruck pour les allergies ? prise en charge handicap détaillée ?) requiert de stocker de la santé, **il faudra rouvrir le chantier HDS**. L'architecture restera possible via la couche d'abstraction prévue.
