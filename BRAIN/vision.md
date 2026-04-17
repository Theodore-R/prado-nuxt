---
type: vision
updated: 2026-04-17
---

# Vision — Prado Itinéraires

## En une phrase

Plateforme numérique socio-éducative qui connecte les professionnels de l'accompagnement (prescripteurs) aux jeunes de 11–25 ans bénéficiaires de l'[[entities/association-prado|association Le Prado]] et à ses partenaires, sur le territoire Lyon / Rhône / Ain / Isère.

## Pourquoi

L'association Le Prado accompagne la jeunesse en difficulté depuis 1860. La **Fondation du Prado** a lancé en 2021 l'association **Prado Itinéraires** comme incubateur d'innovations sociales : faire le lien entre les jeunes accompagnés (ASE, PJJ, handicap, décrochage, insertion) et des environnements porteurs — ateliers, stages, formations, ressources.

Avant la plateforme, tout passait par **formulaires papier + Excel + Mailchimp**, avec une compilation manuelle des indicateurs pour les rapports d'activité aux financeurs. La plateforme remplace cet empilement par :
- un **site vitrine** moderne, éditable par l'équipe sans code (CMS Prismic),
- un **espace prescripteur** où les professionnels référents gèrent leurs jeunes et les inscrivent aux actions,
- un **panel admin** pour l'équipe Prado : validation des comptes, gestion des actions, statistiques, module budget, rapports PDF aux financeurs.

## Ce qu'on construit (V1)

Trois espaces, un seul produit :

1. **Site vitrine public** — accueil éditorial, catalogue d'actions, ressources, actualités, pages programmes, contact, newsletter.
2. **Espace prescripteur** (authentifié, validé par Prado) — dashboard, CRUD jeunes, inscription aux actions (individuelle ou groupée), suivi, paramètres RGPD.
3. **Panel admin** (équipe Prado) — validation des prescripteurs, gestion des actions (y compris récurrentes), émargement des présences, module statistiques (reproduction du rapport d'activité), module budget confidentiel (ventilation par organisme), rapport d'action PDF, gestion contacts et newsletter.

Voir [[concepts/fonctionnalites-v1]] pour la liste détaillée.

## Pour qui

Voir [[entities/utilisateurs]].

- **Visiteurs** — grand public, partenaires, financeurs.
- **Prescripteurs** — éducateurs, référents ASE/PJJ, conseillers en insertion, etc. Rattachés à un **organisme** (structure Prado ou partenaire externe).
- **Équipe Prado (admin)** — direction Itinéraires + équipe technique/pédagogique.

**Règle fondatrice d'isolation** : les jeunes sont rattachés à un **organisme**, pas à un prescripteur individuel. Tous les prescripteurs d'un même organisme partagent l'accès à ses jeunes ; aucun ne voit ceux d'un autre organisme. Garanti par RLS PostgreSQL (pas uniquement dans l'UI).

## Programmes

Voir [[programmes/index-programmes]] pour le détail, mais en substance quatre piliers :

1. **Jeunes & Autonomes** — catalogue d'actions et ateliers (89 prévus/an), ressources pro (183).
2. **Foodtruck Les Saveurs d'Élise** — insertion par l'activité économique, restauration mobile.
3. **Compétences parentales** — *Ces Années Incroyables* + *Parent d'Ado*.
4. **La Fresque de la Protection de l'Enfance** — atelier collaboratif inspiré de la Fresque du Climat.

## Stack

Nuxt 3 + Vue 3 + Tailwind 4 · Supabase (EU) · Prismic · Resend · Mailchimp · Cloudflare · Vercel. Détail dans [[concepts/tech-stack]].

## Contraintes clés

- **RGPD** accompagné par le dispositif mutualisé du Prado (pas de prestation DPO séparée ; voir [[concepts/rgpd]]).
- **Pas d'hébergement HDS** (les données de santé ont été retirées du scope, cf. [[sources/echange-client-2026-04-01]]).
- **Charte graphique Fondation Prado** en cours de refonte, version finale attendue fin avril 2026. Palette actuelle : voir [[concepts/design-system]].
- **Pas de vérification d'identité en V1** (Veriff retiré ; voir évolutions V2).
- **Hébergement et services tiers au nom du client** — chaque compte (Supabase, Vercel, Prismic, Cloudflare, Resend, Mailchimp) créé pour l'association Le Prado, facturation directe.

## Ambitions V2+

Évolutions envisagées (non contractualisées) : vérification d'identité Veriff ou France Identité, réassignation de jeunes entre organismes, notifications in-app, cartographie interactive des actions, PWA mobile, statistiques avancées. Voir [[concepts/roadmap]].

## Budget & échéances

- **Devis v2** : 36,5 jours · 21 900 € HT répartis en 7 lots. Acompte 30 % / situation 30 % / solde 40 %.
- **Coûts récurrents clients** : ~25 €/mois au lancement, ~65–85 €/mois à maturité.
- **Date de livraison** à préciser (attente réponse visio client).

Source de vérité courante : [[client-docs/index-client-docs|devis-prado-itineraires.md]] + [[sources/cahier-des-charges-v2]].

## État actuel du projet (vu du code)

Le dépôt Git a déjà livré la plupart des fonctionnalités V1 — site vitrine, auth, espace prescripteur, admin, onboarding, thème clair/sombre, migration Prismic, tests E2E Playwright, package `@theodoreriant/prado-ui` publié sur npm. Reste à finaliser selon les ajustements client (retrait santé/Veriff, ajouts budget/émargement/récurrence). Voir les derniers commits (`git log`) pour l'état précis.
