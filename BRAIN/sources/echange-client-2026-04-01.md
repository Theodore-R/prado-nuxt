---
type: source
updated: 2026-04-17
source: ../../docs/echanges/nouveau-site-prado-itineraires/01-client-2026-04-01.md
---

# Source — Email client du 1 avril 2026

**Document** : `docs/echanges/nouveau-site-prado-itineraires/01-client-2026-04-01.md`
**De** : Cliente (Direction Itinéraires)
**À** : Théodore
**Objet** : Nouveau site Prado Itinéraires

## Rôle : moment charnière du scope

Email **fondateur** pour le scope V1 actuel. Tous les ajustements post-CDC initial viennent d'ici.

## 11 demandes concrètes (toutes validées en réponse)

| # | Demande | Impact |
|---|---|---|
| 1 | Traduire le devis en € (pas juste en jours) | → [[sources/devis-v2]] |
| 2 | RGPD : retirer prestation dédiée (dispositif mutualisé Prado) | Économie + [[concepts/rgpd]] |
| 3 | Renommer "fiche santé" → "fiche jeune" | Simplification |
| 4 | **Supprimer fiche santé + fiche situation familiale** | Supprime besoin HDS ~30-50 €/mois · [[concepts/hds-historique]] |
| 5 | Adresse → **code postal + checkbox QPV** | [[concepts/modele-donnees#jeunes]] |
| 6 | Champ **"accompagnement au titre de"** multi-choix (ASE/PJJ/Handicap/décrochage/RSJ/CEJ/Autre) | [[concepts/modele-donnees#jeunes]] |
| 7 | **Pas de vérification d'identité V1** | Économie 2 j/1 200 € + ~1 €/vérif · reporté V2 |
| 8 | **Filtre par année** dashboard prescripteur (rapports d'activité) | [[concepts/fonctionnalites-v1]] |
| 9 | Boutons **accompagnateur présent / autonomie** à l'inscription | [[concepts/inscription-jeune-action]] |
| 10 | Charte graphique : attendre fin avril (démarrer avec couleurs actuelles) | [[concepts/design-system]] |
| 11 | **Coût d'une action** en backoffice + récapitulatif annuel | [[concepts/module-budget]] |

## Raison client

> « Nous n'avons aucun détail de santé hormis le fait qu'un jeune peut être orienté vers nos actions via son suivi par une structure exerçant dans le champ du handicap. »

Implication : le handicap est connu comme **catégorie d'accompagnement** (via `accompagnement_type`), pas comme donnée médicale détaillée. C'est la clé de la simplification HDS.

> « Dans mon récapitulatif des actions réalisées, je puisse avoir le montant total, année par année, avec la somme du coût de chaque action réalisée. »

Implication : genèse du [[concepts/module-budget|module budget]].

## Pages wiki qui dérivent directement de cet email

- [[concepts/module-budget]]
- [[concepts/hds-historique]] (note de retrait)
- [[concepts/inscription-jeune-action]] (accompagnateur/autonomie)
- [[concepts/modele-donnees#jeunes]] (schéma simplifié)
- [[concepts/rgpd]] (dispositif mutualisé)
- [[concepts/roadmap]] (Veriff → V2)

## Réponse et suite

- Réponse Théodore le même jour : [[sources/reponse-2026-04-01]] — toutes demandes acceptées, proposition de visio.
- Préparation visio : [[sources/prep-visio-2026-04-01]].
