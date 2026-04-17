# Log — BRAIN

Journal chronologique append-only. Les entrées les plus récentes **en bas**.

Format :
```
## [YYYY-MM-DD] <kind> | <title>
<1-3 lignes : ce qui a été fait, pages touchées, contradictions détectées>
```

Kinds : `setup`, `ingest`, `query`, `lint`, `decision`.

---

## [2026-04-17] setup | Initialisation du BRAIN

Création du workspace Obsidian. Schéma posé dans `CLAUDE.md`, structure en 4 catégories (entities/programmes/concepts/sources) + client-docs. Vision synthétique écrite dans `vision.md`.

Pages créées (27) :
- 5 entities : association-prado, fondation-prado, utilisateurs, organismes, theodore
- 4 programmes + 1 index programmes
- 17 concepts couvrant produit, sécurité, technique, infra
- 12 sources ingérées (voir l'ingest ci-dessous)
- 1 index client-docs
- index.md + log.md + vision.md

## [2026-04-17] ingest | 12 sources ingérées en batch

Sources résumées : PRD, cahier-des-charges-v2, devis-v2, architecture-complete, homepage-content-spec, comparatif-wordpress-vs-webapp, questions-client, presentation-client, tests-visuels, session-handoff-homepage, echange-client-2026-04-01, reponse-2026-04-01, prep-visio-2026-04-01.

**Contradictions détectées** entre la PRD et le CDC v2 :
- La PRD décrit `jeune_sante` + plan HDS + intégration Veriff. Ces éléments ont été **retirés** par l'email client du 1 avril 2026. Marqués dans `concepts/hds-historique.md` (status: retiré) et dans `sources/prd.md` (bandeau "contexte historique").
- La PRD utilise `prescripteur_id` pour l'isolation RLS, le CDC v2 utilise `organisme_id` (les collègues d'un même organisme partagent). Documenté dans `concepts/rls-isolation.md`.
- La PRD ne mentionne ni module budget, ni émargement, ni actions récurrentes, ni rapport PDF — tous ajoutés dans le CDC v2 post-feedback client.

**Règle établie** : CDC v2 + devis v2 = source de vérité scope/coût. PRD = contexte technique historique, à lire avec précaution.

## [2026-04-17] lint | Premier health-check

Wiki : **45 pages** (5 entities, 5 programmes, 16 concepts, 12 sources, index client-docs, index, log, vision, CLAUDE).

- **252 wikilinks**, 0 broken après correction (escaped pipes dans tables et exemples-placeholder retirés).
- **0 orphelines** — chaque page a au moins un lien entrant.
- **Hubs principaux** (plus de liens entrants) : sources/devis-v2 (15), sources/echange-client-2026-04-01 (12), sources/cahier-des-charges-v2 (10), concepts/emargement / module-budget / rls-isolation / hds-historique (8 chacun).
- **Contradictions connues documentées** : PRD vs CDC v2 (santé, Veriff, isolation RLS). Voir bandeau d'avertissement dans sources/prd et concepts/hds-historique.

**Questions à poser à Théodore / au client** (suivi) :
- Durée de conservation RGPD des jeunes (prep-visio §22, non tranchée).
- Accessibilité RGAA — fonds publics → niveau à viser (prep-visio §23).
- Accompagnateurs : texte libre ou BDD réutilisable (prep-visio §5, le plus structurant).
- Chiffres 89/183/500+ de la home à re-valider avec le prochain rapport d'activité.
- Numéro de téléphone public `04 72 XX XX XX` à compléter.
- Logos partenaires à collecter (7 partenaires listés).
- Liste des organismes partenaires — de référence ou saisie libre ?
