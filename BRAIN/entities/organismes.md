---
type: entity
updated: 2026-04-17
---

# Organismes (structures prescriptrices)

Unité de rattachement des [[entities/utilisateurs#2-prescripteur|prescripteurs]] et des jeunes. Pierre angulaire de l'**isolation des données**.

## Définition

Un **organisme** = une structure professionnelle qui emploie un ou plusieurs prescripteurs et accompagne des jeunes. Peut être une structure du Prado (MECS, Foyer, SAVS…) ou un partenaire externe (association, établissement scolaire, mission locale, etc.).

Types mentionnés dans le modèle : MECS, Foyer, Service, etc. (enum ouvert, `type` sur la table `organismes`).

## Règle d'or

> **Les jeunes sont rattachés à l'organisme, pas au prescripteur individuel.**

Conséquences :
- Deux prescripteurs du **même organisme** partagent l'accès aux mêmes jeunes (lecture et écriture).
- Aucun prescripteur ne voit les jeunes d'un **autre organisme**. Jamais. Même en cas de bug applicatif — l'isolation est garantie par les RLS policies PostgreSQL au niveau de la base, pas seulement par l'UI.
- Si un prescripteur quitte son poste, ses jeunes restent accessibles à ses collègues de l'organisme.

## Structure du Prado vs partenaires

Le champ `is_prado` sur la table `organismes` distingue les structures internes du Prado des partenaires externes. Utile pour les stats (« nombre d'organismes prescripteurs dont X structures du Prado »).

## Établissements d'accueil

À **ne pas confondre** avec les organismes : les **établissements** (`etablissements`) sont les lieux où se déroulent les actions, pas les structures d'où viennent les jeunes. Une action est rattachée à un établissement d'accueil.

## Questions ouvertes

- Liste de référence des organismes partenaires fournie par le client ? Mise à jour à quelle fréquence ? Ajout depuis l'admin ?  
  → question n°3 dans [[sources/questions-client]].
- Réassignation d'un jeune d'un organisme à un autre : envisagée en V2 (voir [[concepts/roadmap]]).
