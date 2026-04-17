---
type: source
updated: 2026-04-17
source: ../../comparatif-wordpress-vs-webapp.md
---

# Source — Comparatif WordPress vs application sur-mesure

**Document** : `comparatif-wordpress-vs-webapp.md`
**Nature** : document de ventes / pédagogie client pour justifier le choix Nuxt + Supabase + Prismic plutôt que WordPress + plugins.

## Thèse

Le projet **n'est pas un site vitrine classique**. Il nécessite authentification prescripteur, espace pro avec tableau de bord, gestion jeunes, workflow validation, capacité temps réel, emails transactionnels, dashboard admin avec stats. Concrètement, **70 % des fonctionnalités demanderaient du dev sur-mesure même sur WordPress** — on hérite alors du pire des deux mondes.

## Grille de synthèse (extrait)

| Critère | WordPress | Sur-mesure |
|---|---|---|
| Délai vitrine | 2-4 sem | 4-6 sem |
| Délai métier | 8-16 sem | 6-10 sem |
| Coût initial | Élevé | Modéré |
| Maintenance | Élevée (plugins) | Faible |
| Sécurité | Risque élevé | Maîtrisée |
| Performance | Variable | Optimale |
| Évolutivité | Limitée | Illimitée |

## Arguments contre WordPress utilisés dans le doc

- Cible n°1 des attaques automatisées (~43 % du web).
- Chaque plugin = vecteur d'attaque potentiel.
- Lourdeur monolithique PHP + plugins cache obligatoires.
- wp-cron peu fiable.
- Back-office pensé contenu, pas gestion de données relationnelles.
- 30 % des plugins ne sont pas maintenus depuis 2+ ans.

## Arguments pour l'architecture choisie

- Séparation claire contenu (CMS headless) / données métier (BDD relationnelle).
- SSR + hydratation → SEO + UX fluide.
- Contrôle total de la sécurité, pas de plugins tiers.
- Maintenance stable, dette technique contenue.

## Utilisation

Ce document est un **outil commercial** pour répondre à une question récurrente chez les associations. À réutiliser pour les prochains clients ou pour défendre le choix si remis en cause.

## Voir aussi

- [[sources/cahier-des-charges-v2]] §6.2 — le "pourquoi Nuxt 3 + Vue 3" est repris dans le CDC en accordéons.
