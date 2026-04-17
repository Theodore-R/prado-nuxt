---
type: source
updated: 2026-04-17
source: ../../docs/PRD-prado-itineraires.md
---

# Source — PRD interne

**Document** : `docs/PRD-prado-itineraires.md`
**Origine** : document de référence technique interne, rédigé côté Théodore, plus ancien que le cahier des charges v2.

## Statut : contexte historique

⚠️ La PRD décrit un état du projet **antérieur aux retours client du 1 avril 2026**. Ne pas prendre comme source de vérité actuelle sur le scope. Elle reflète l'état de l'implémentation V1 **technique** (ce qui est dans le code), alors que le [[sources/cahier-des-charges-v2]] et le [[sources/devis-v2]] reflètent le scope **contractuel actuel** après ajustements client.

## Ce qui reste valide

- Stack technique ([[concepts/tech-stack]]) — Nuxt/Supabase/Prismic/Resend/Vercel/Cloudflare.
- Architecture d'ensemble (3 espaces : visiteur, prescripteur, admin).
- Flux d'authentification ([[concepts/auth-flow]]).
- Comptes de test : `theo@allside.studio / Allside2026!`, `test-veriff@prado.fr / TestVeriff2026!` (approuvés).
- Références services :
  - Supabase projet `vafbtwbsxdlefksonpyg`
  - Prismic via slicemachine
  - Veriff station.veriff.com (compte Prado)

## Ce qui est **obsolète**

| Élément PRD | État actuel |
|---|---|
| Table `jeune_sante` (allergies, handicap, suivi médical…) | **Supprimée** — cf. [[concepts/hds-historique]] |
| Plan de migration HDS (OVH Healthcare / Scaleway…) | **Retiré** — plus nécessaire |
| Intégration **Veriff** (KYC jeunes) | **Reportée V2** — cf. [[concepts/roadmap]] |
| Adresse complète du jeune | → **Code postal + checkbox QPV** uniquement |
| Schéma RLS `prescripteur.id = uid` | → Remplacé par isolation par `organisme_id` ([[concepts/rls-isolation]]) |
| Références Autocomplétion adresses (Geoplateforme) | Devenu marginal (plus besoin pour jeune — peut rester si usage ailleurs) |

## Ce qui est absent de la PRD mais présent dans le scope actuel

- [[concepts/module-budget|Module budget]] (ventilation par organisme)
- [[concepts/emargement|Émargement des présences]]
- [[concepts/actions-recurrentes|Actions récurrentes]]
- [[concepts/rapport-action-pdf|Rapport PDF]]
- Module statistiques complet ([[concepts/module-statistiques]])
- Filtre par année du dashboard prescripteur
- Inscription groupée
- Accompagnateur / autonomie + attestation de responsabilité bloquante

## Recommandation

Mettre à jour la PRD quand le chantier client stabilise. Pour l'instant, naviguer cette source avec précaution et toujours croiser avec [[sources/cahier-des-charges-v2]] et [[sources/echange-client-2026-04-01]].
