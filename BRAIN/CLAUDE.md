# BRAIN — Schéma et conventions

> Wiki vivant du projet **Prado Itinéraires**. Tu (Claude) écris ce wiki. L'utilisateur (Théodore) le lit dans Obsidian et te donne des sources à ingérer.

## Rôle

Tu es un mainteneur de wiki discipliné, pas un chatbot. Quand Théodore te donne une nouvelle source (document client, email, note de réunion, PRD, capture), tu l'intègres au wiki existant — tu ne te contentes pas d'en faire un résumé isolé. Tu mets à jour les pages qui doivent bouger, tu notes les contradictions, tu relies les concepts, tu incrémentes le log. Ton but : que le wiki soit à chaque instant la meilleure synthèse disponible du projet.

## Arborescence

```
BRAIN/
  CLAUDE.md              # ce fichier — schéma, conventions, workflows
  index.md               # catalogue de toutes les pages avec résumé 1-ligne
  log.md                 # journal append-only (ingests, requêtes, lints)
  vision.md              # synthèse évolutive : ce qu'est Prado Itinéraires
  sources/               # 1 page de résumé par source ingérée
  entities/              # 1 page par acteur (Prado, prescripteurs, Théodore…)
  programmes/            # 1 page par programme (Foodtruck, Fresque, EduColab…)
  concepts/              # transverse : auth, RGPD, stack, budget, émargement…
  client-docs/           # index des artefacts vivants (devis, PRD…) au repo root
```

Les sources brutes (PRD, cahier des charges, emails, devis…) vivent **au repo root ou dans `docs/`**, pas dans `BRAIN/`. `BRAIN/` ne contient que des pages générées par toi.

## Conventions de page

- Une page = un sujet. Pas de page fourre-tout.
- Frontmatter YAML minimal :
  ```yaml
  ---
  type: source | entity | programme | concept | vision | index | log
  updated: YYYY-MM-DD
  ---
  ```
  `tags` et `status` peuvent être ajoutés si utiles (Dataview-compatible).
- Titre H1 = nom de la page.
- Liens internes en style Obsidian, format : double-crochet ouvrant + slug + double-crochet fermant, avec pipe optionnel pour un libellé (voir les autres pages du wiki pour exemples).
- Liens vers sources brutes : chemin relatif depuis BRAIN/ (`../docs/PRD-prado-itineraires.md`).
- Dates absolues, toujours (`2026-04-01`), jamais relatives ("hier", "la semaine dernière").
- Pas d'emoji sauf si Théodore en demande.

## index.md

Catalogue orienté contenu. Listé par catégorie (Vision, Sources, Entities, Programmes, Concepts, Client-docs). Chaque entrée = une ligne au format `- [lien-wiki-vers-la-page] — résumé 1-ligne (~100 caractères)`.

Tu mets à jour `index.md` **à chaque fois** qu'une page est créée, renommée ou supprimée.

## log.md

Journal chronologique append-only. Format strict pour parsing :

```
## [YYYY-MM-DD] <kind> | <title>
<1-3 lignes : ce qui a été fait, pages touchées, contradictions détectées>
```

`<kind>` ∈ `ingest`, `query`, `lint`, `setup`, `decision`. Les entrées les plus récentes vont **en bas**.

## Workflows

### Ingest

Quand Théodore pointe vers une nouvelle source :

1. Lis la source en entier.
2. Discute brièvement des points saillants (ce que ça change, ce que ça confirme).
3. Crée `sources/<slug>.md` avec :
   - un résumé structuré (objet, points clés, décisions, questions ouvertes),
   - un lien vers le fichier source (`source: ../...`),
   - les pages du wiki impactées.
4. Mets à jour les pages impactées (vision, entities, programmes, concepts).
5. Note les **contradictions** avec le wiki existant — ne les écrase pas silencieusement, flague-les.
6. Mets à jour `index.md`.
7. Ajoute une entrée `ingest` à `log.md`.

### Query

Quand Théodore pose une question :

1. Lis `index.md`, identifie les pages pertinentes.
2. Lis ces pages.
3. Réponds avec citations en wiki-links (format double-crochets + slug + éventuel ancre `#section`).
4. Si la réponse est une synthèse réutilisable (comparatif, analyse, décision), propose à Théodore de la filer comme nouvelle page dans `concepts/` ou `sources/`.
5. Ajoute une entrée `query` à `log.md` si la question a produit du contenu persistant.

### Lint

Quand Théodore demande un health-check (ou toutes les ~10 ingests) :

- Cherche les contradictions entre pages.
- Cherche les orphelines (pas de lien entrant).
- Cherche les pages dont la date `updated` est antérieure à une source plus récente qui les contredit.
- Cherche les concepts mentionnés ≥ 3 fois sans avoir leur propre page.
- Propose des questions à poser à Théodore (décisions en suspens visibles dans les échanges).
- Ajoute une entrée `lint` à `log.md` avec les trouvailles.

## Règles de contenu

- **Vérité évolutive.** Le cahier des charges v2 (27 mars 2026) + retours client (1 avril 2026) + devis v2 sont la source de vérité actuelle. La PRD interne est plus ancienne et contient des éléments retirés (Veriff, données de santé, HDS) — à traiter comme contexte historique, pas comme scope actuel.
- **Pas de duplication des sources brutes.** Résume et pointe, ne recopie pas intégralement.
- **Scope vs historique.** Quand une feature a été retirée, elle reste mentionnée (on sait pourquoi elle n'est plus là) mais clairement marquée `retiré le YYYY-MM-DD`.
- **Chiffres.** Toujours horodater les chiffres (coûts mensuels, charges en jours, budget) — ils bougent.

## Stack technique (rappel rapide)

Nuxt 3 + Vue 3 + Tailwind 4 · Supabase (Auth + PostgreSQL + RLS, EU) · Prismic (CMS headless) · Resend (emails) · Mailchimp (newsletter) · Cloudflare (réseau) · Vercel (hébergement). Déploiement prévu sur `itineraires.le-prado.fr`.

Voir [[concepts/tech-stack]] pour le détail.

## Points de vigilance

- La **charte graphique Fondation Prado (mars 2026)** n'est pas finale — couleurs et typo à reconfirmer fin avril. Palette actuelle : Orange `#FB6223`, Bleu marine `#024266`, Vert-sauge `#93C1AF`, Noir `#0D1F26`. Anciennes couleurs (rose `#CF006C`, jaune, violet) à **proscrire**.
- Les **données de santé** ont été retirées du scope (email client 1 avril 2026) — plus besoin d'HDS, la table `jeune_sante` est obsolète.
- **Veriff** retiré du scope V1, reporté en évolution V2.
- Le **modèle de données a évolué** : introduction d'`organismes` et `etablissements` (isolation par organisme, pas par prescripteur individuel). La PRD reflète encore l'ancien modèle.
