# Index — BRAIN

Catalogue de toutes les pages du wiki Prado Itinéraires. Le schéma et les règles sont dans [[CLAUDE]].

## Vision

- [[vision]] — synthèse évolutive : ce qu'est Prado Itinéraires, pour qui, pourquoi, avec quoi

## Entities

- [[entities/association-prado]] — l'association porteuse du projet (création 2021, Fondation du Prado)
- [[entities/fondation-prado]] — la fondation historique (1860), charte graphique commune
- [[entities/utilisateurs]] — les 3 rôles : visiteur, prescripteur, admin
- [[entities/organismes]] — structures prescriptrices, pierre angulaire de l'isolation RLS
- [[entities/theodore]] — prestataire, tarifs, rôle contractuel

## Programmes

- [[programmes/index-programmes]] — les 4 piliers éditoriaux
- [[programmes/jeunes-et-autonomes]] — catalogue actions + ressources pro (89 actions/an)
- [[programmes/foodtruck]] — Les Saveurs d'Élise, insertion par l'activité économique
- [[programmes/competences-parentales]] — Ces Années Incroyables + Parent d'Ado
- [[programmes/fresque-protection-enfance]] — atelier collaboratif 2h30 jusqu'à 14 participants

## Concepts

### Produit / fonctionnel
- [[concepts/fonctionnalites-v1]] — liste des features V1 (critiques, hautes, retirées, déjà livrées)
- [[concepts/roadmap]] — évolutions V2+ non contractualisées
- [[concepts/inscription-jeune-action]] — parcours d'inscription, accompagnateur/autonomie, attestation
- [[concepts/actions-recurrentes]] — séries d'occurrences avec gestion individuelle
- [[concepts/emargement]] — pointage présences, stats dérivées, export PDF
- [[concepts/rapport-action-pdf]] — génération PDF pour financeurs
- [[concepts/module-budget]] — ventilation totale par organisme, récap annuel
- [[concepts/module-statistiques]] — reproduction du rapport d'activité
- [[concepts/ressources]] — documents Prismic, 183 ressources pro

### Auth / sécurité / compliance
- [[concepts/auth-flow]] — email-first, magic link ou mdp, workflow pending/approved/rejected
- [[concepts/rls-isolation]] — isolation par organisme garantie au niveau PostgreSQL
- [[concepts/rgpd]] — dispositif mutualisé Prado + mesures techniques plateforme
- [[concepts/hds-historique]] — exigence HDS retirée le 1 avril 2026 (note historique)

### Technique / infra
- [[concepts/tech-stack]] — Nuxt/Vue/Tailwind + Supabase/Prismic/Resend/Mailchimp/Cloudflare/Vercel
- [[concepts/modele-donnees]] — tables principales et relations
- [[concepts/deploiement]] — URLs, pipeline CI/CD, cron, config à faire avant MEP
- [[concepts/couts-recurrents]] — 25 €/mois au lancement, 65–85 €/mois à maturité
- [[concepts/design-system]] — palette actuelle (orange/marine/sauge), tokens, responsive, animations
- [[concepts/emails-automatiques]] — Resend (transactionnels) + Mailchimp (newsletter)

## Sources

- [[sources/prd]] — PRD interne (⚠️ partiellement obsolète depuis 1 avril)
- [[sources/cahier-des-charges-v2]] — **source de vérité scope** (v1.0 du 27 mars)
- [[sources/devis-v2]] — **source de vérité coût** (v2.0 du 2 avril, 21 900 € HT)
- [[sources/architecture-complete]] — diagrammes Mermaid (reflet PRD)
- [[sources/homepage-content-spec]] — contenu rédigé des 10 sections home
- [[sources/comparatif-wordpress-vs-webapp]] — doc commercial/pédagogique
- [[sources/questions-client]] — 15 questions initiales, certaines tranchées
- [[sources/presentation-client]] — présentation équipe Prado (partiellement obsolète)
- [[sources/tests-visuels]] — checklist recette visuelle
- [[sources/session-handoff-homepage]] — prompt de reprise refonte home
- [[sources/echange-client-2026-04-01]] — email client, 11 demandes, moment charnière
- [[sources/reponse-2026-04-01]] — réponse Théodore, toutes demandes acceptées
- [[sources/prep-visio-2026-04-01]] — prep interne visio, 23 questions

## Client docs

- [[client-docs/index-client-docs]] — index des artefacts vivants (devis, CDC, comparatif, etc.)

## Log

- [[log]] — journal chronologique des ingests, queries, lints
