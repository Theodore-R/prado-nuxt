---
type: source
updated: 2026-04-17
source: ../../docs/cahier-des-charges-prado-itineraires.md
---

# Source — Cahier des charges v1.0 (27 mars 2026)

**Document** : `docs/cahier-des-charges-prado-itineraires.md`
**Client** : Association Le Prado — Direction Itinéraires
**Prestataire** : Devops (Théodore)
**Version** : 1.0 du 27 mars 2026 · Statut : soumis pour validation

## Statut : source de vérité scope

Document **contractuel** soumis au client, remanié après l'[[sources/echange-client-2026-04-01|email client du 1 avril]]. Les ajustements demandés par la cliente ont été intégrés dans cette version v1.0 (bien que datée du 27 mars — à recroiser si une v1.1 existe côté Devops).

## Structure (16 sections)

1. Introduction et contexte
2. Les trois espaces
3. Parcours utilisateurs
4. Fonctionnalités détaillées (vitrine / prescripteur / admin)
5. UX/UI et design — voir [[concepts/design-system]]
6. Architecture technique — voir [[concepts/tech-stack]]
7. Base de données et modèle — voir [[concepts/modele-donnees]]
8. Intégrations et services tiers
9. Emails et newsletter — voir [[concepts/emails-automatiques]]
10. Sécurité et conformité RGPD — voir [[concepts/rgpd]]
11. Migration des données existantes
12. Déploiement et infrastructure — voir [[concepts/deploiement]]
13. **Coûts récurrents** — voir [[concepts/couts-recurrents]]
14. Roadmap V1 / V2 — voir [[concepts/fonctionnalites-v1]], [[concepts/roadmap]]
15. FAQ
16. Glossaire (ASE, PJJ, QPV, RLS, CEJ, RSJ, OWASP, etc.)

## Points saillants

- **Isolation par organisme** — pierre angulaire du projet, garantie RLS. Voir [[concepts/rls-isolation]].
- **Trois espaces** : visiteur / prescripteur / admin, avec matrice de droits détaillée. Voir [[entities/utilisateurs]].
- **Module budget confidentiel** avec **ventilation totale par organisme** (le coût n'est pas divisé — chaque organisme comptabilise le coût total). [[concepts/module-budget]]
- **Émargement numérique** requis par les financeurs. [[concepts/emargement]]
- **Rapport d'action PDF** destiné aux financeurs. [[concepts/rapport-action-pdf]]
- **Architecture v2 du modèle** : introduction de `organismes` et `etablissements` comme tables de premier niveau. La PRD n'en parle pas.
- **Hébergement** : toutes les ressources (Supabase, Vercel, Prismic, Cloudflare, Resend) **au nom du client**, facturation directe.
- **Coûts récurrents** : 25 €/mois au lancement, 65–85 €/mois à maturité.

## Ce qui est dans cette version et pas dans la PRD

- Tables `organismes` et `etablissements`.
- Module budget.
- Émargement.
- Rapport d'action PDF.
- Actions récurrentes.
- Inscription groupée.
- Accompagnateur/autonomie + attestation bloquante.
- Filtre par année dashboard prescripteur.
- Nouvelle palette Fondation Prado (orange + marine + vert-sauge).

## Ce qui a disparu par rapport à la PRD

- Fiche santé, fiche situation familiale.
- Plan HDS.
- Veriff (renvoyé V2).
- Adresse complète (→ code postal + QPV).

## Pages wiki issues directement de ce document

- [[entities/utilisateurs]], [[entities/organismes]]
- [[concepts/modele-donnees]], [[concepts/rls-isolation]]
- [[concepts/design-system]], [[concepts/rgpd]], [[concepts/tech-stack]]
- [[concepts/deploiement]], [[concepts/couts-recurrents]]
- [[concepts/module-budget]], [[concepts/module-statistiques]], [[concepts/emargement]], [[concepts/rapport-action-pdf]]
- [[concepts/actions-recurrentes]], [[concepts/inscription-jeune-action]]
- [[concepts/emails-automatiques]], [[concepts/ressources]]
- [[concepts/fonctionnalites-v1]], [[concepts/roadmap]]
