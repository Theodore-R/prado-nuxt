---
type: concept
updated: 2026-04-17
---

# Périmètre V1

Liste des fonctionnalités prévues pour la première version de la plateforme (cf. [[sources/cahier-des-charges-v2]] §14.1 + [[sources/devis-v2]]).

## Critiques (🔴)

- Site vitrine complet avec CMS Prismic
- Authentification (magic link + mot de passe) — [[concepts/auth-flow]]
- Espace prescripteur (dashboard, jeunes, inscriptions)
- Panel admin (validation, gestion actions, stats)
- [[concepts/module-statistiques|Module statistiques]] (reproduction rapport d'activité)
- [[concepts/module-budget|Module budget]] (ventilation par organisme)
- Responsive (mobile, tablette, desktop)

## Hautes (🟡)

- Onboarding avec checklist interactive (widget de démarrage)
- [[concepts/emargement|Émargement des présences]] (admin)
- [[concepts/rapport-action-pdf|Rapport d'action PDF]] (téléchargement + envoi email)
- [[concepts/actions-recurrentes|Actions récurrentes]]
- Inscription groupée (multi-jeunes en une seule op)
- Slider actualités sur la page d'accueil
- Filtre par année dans dashboard prescripteur (rapports d'activité)
- Thème clair / sombre
- Newsletter avec double opt-in
- Export CSV (jeunes, contacts, newsletter)
- [[concepts/emails-automatiques|Emails de rappel J-1 / J-2]]
- Formulaire de contact
- Pages programmes (Foodtruck, Fresque, EduColab)

## Retirées V1

- Vérification d'identité Veriff — évolution V2
- Fiche santé + situation familiale — simplifiées en [[concepts/modele-donnees#jeunes|fiche jeune unique]]
- Hébergement HDS — plus nécessaire, voir [[concepts/hds-historique]]
- Adresse complète du jeune → code postal + checkbox QPV

## Ce qui est **déjà** livré (d'après les commits)

Le dépôt montre qu'une bonne partie du site est déjà en production :
- Site vitrine migré depuis React vers Nuxt 3
- 142 actions + 187 ressources dans Prismic
- Admin dashboard, prescripteurs, inscriptions
- Onboarding interactif
- Thème clair/sombre
- Migrations CDC v2 sur Supabase (commit `d566a57`)
- Tests E2E Playwright (commit `4ab8ca2`)
- Package `@theodoreriant/prado-ui` publié sur npm

Reste notamment : intégrer pleinement les nouvelles demandes client du 1 avril 2026 (module budget, émargement, actions récurrentes, retrait santé/Veriff) + finaliser à la charte graphique fin avril.
