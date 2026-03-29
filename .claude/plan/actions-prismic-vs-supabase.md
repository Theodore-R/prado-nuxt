# Analyse : Actions dans Prismic vs Supabase-only

## Situation actuelle — Systeme hybride fragile

Aujourd'hui, les actions vivent dans **les deux systemes** simultanement :

| Donnee | Prismic | Supabase |
|--------|:---:|:---:|
| title | oui | oui |
| category | oui | oui |
| date/time | oui | oui |
| summary | oui | oui |
| description | oui (RichText) | oui (string) |
| image | oui (CDN) | oui (url_image) |
| url_detail | oui | oui |
| is_activite | oui | oui |
| original_id | oui (pont) | — |
| places_max | — | oui |
| is_published | — | oui |
| inscriptions (FK) | — | oui |

**Constat : 8 champs sont dupliques entre les deux systemes.**

Le pont entre les deux est `original_id` (Prismic) == `id` (Supabase).

---

## Problemes concrets du systeme actuel

### 1. Double source de verite
Quand une action est modifiee, il faut la modifier aux deux endroits. Si Prismic a "Atelier cuisine" mais Supabase a "Atelier Cuisine bis", le cron `send-reminders.ts` envoie le titre Supabase (pas Prismic).

### 2. Le pont `original_id` est fragile
- Aucune contrainte d'integrite — si on supprime une action Supabase, Prismic garde un document orphelin
- Le mapping se fait manuellement dans les scripts de migration
- Si un script plante a mi-chemin, les IDs divergent

### 3. Jointures impossibles
La page admin `actions.vue` doit :
1. Fetcher les actions depuis Prismic (`getAllByType('action')`)
2. Fetcher les places depuis Supabase (`/api/action-places`)
3. Merger cote client avec une Map sur `original_id`

Impossible de faire un `SELECT actions.title, COUNT(inscriptions.id)` en une seule requete.

### 4. Types non generes
`prismicio-types.d.ts` ne contient PAS le type `action` — seulement `actualite` et `homepage`. Tous les acces aux champs Prismic utilisent `as string`, `as number`, `as boolean` — zero type-safety.

### 5. Pipeline de scraping complexe
```
Site Prado → scrape → JSON → migrate-to-prismic.mjs → Prismic
                                                     → Supabase (actions table)
```
Deux destinations a maintenir. Si le script echoue sur Prismic mais reussit sur Supabase (ou inversement), desynchronisation.

### 6. Le cron et les emails ignorent Prismic
`server/api/cron/send-reminders.ts` et `server/api/send-confirmation.post.ts` lisent les actions **directement depuis Supabase** — Prismic n'est meme pas utilise cote serveur pour ces flows critiques.

### 7. Performances inutilement degradees
Chaque page qui affiche des actions + des infos d'inscription doit faire 2 appels reseau (Prismic API + Supabase API) au lieu d'un seul.

---

## Ce que Prismic apporte reellement pour les actions

| Avantage Prismic | Valeur reelle |
|---|---|
| Editeur RichText visuel | **Faible** — les descriptions sont du texte simple dans la pratique, pas de mise en forme complexe |
| CDN images | **Moyen** — utile mais remplacable par Supabase Storage ou n'importe quel CDN |
| Preview/versioning | **Negligeable** — les actions sont scrapees automatiquement, pas editees manuellement |
| Slice Machine | **Non utilise** — le custom type `action` n'utilise aucune slice |
| Cache CDN | **Mineur** — les pages actions utilisent deja `useAsyncData` avec cache Nuxt |

### Verdict : Prismic n'apporte presque rien pour les actions

Prismic est excellent pour le contenu editorial (homepage, actualites) ou un redacteur humain compose visuellement. Mais les actions sont des **donnees operationnelles** scrapees automatiquement — elles n'ont pas besoin d'un CMS.

---

## Proposition : Tout dans Supabase

### Avantages

1. **Source unique de verite** — plus de desynchronisation
2. **Integrite referentielle** — `inscriptions.action_id` FK vers `actions.id`
3. **Jointures natives** — stats, rapports, exports en une seule requete
4. **Types generes** — `supabase gen types` donne du TypeScript exact
5. **Admin simplifie** — CRUD direct sans merger deux sources
6. **Pipeline scraping simplifie** — une seule destination
7. **Moins de code** — suppression du bridge `action-places`, des Maps de mapping, des scripts Prismic
8. **Real-time possible** — Supabase Realtime pour les places restantes
9. **RLS natif** — securite row-level sans couche custom
10. **Cron/emails deja sur Supabase** — zero changement cote serveur

### Ce qu'il faut prevoir

| Point | Solution |
|-------|----------|
| Images | Stocker `url_image` (URL externe Prado) — deja le cas dans Supabase |
| Description riche | Stocker en Markdown ou HTML simple — un `<div v-html>` suffit |
| SEO / meta | Les meta sont deja geres par `useHead()` dans les pages, pas par Prismic |
| Cache | `useAsyncData` + ISR Nuxt couvrent le besoin |
| Migration | Script unique : lire Prismic → confirmer les donnees sont bien dans Supabase → supprimer le custom type Prismic |

---

## Plan de migration (si approuve)

### Etape 1 — Enrichir la table Supabase `actions`
S'assurer que tous les champs Prismic existent dans Supabase :
- `summary` (existe deja)
- `description` text (existe deja)
- `url_image` (existe deja)
- `uid` slug pour les URLs (a ajouter, ou utiliser l'id)

### Etape 2 — Migrer les pages frontend
- `pages/actions/index.vue` : remplacer `prismic.getAllByType('action')` par `$fetch('/api/actions')`
- `pages/actions/[id].vue` : remplacer `prismic.getByUID('action', uid)` par `$fetch('/api/actions/:id')`
- `pages/admin/actions.vue` : supprimer le double-fetch Prismic + Supabase
- `pages/espace/*.vue` : simplifier le mapping `actionId → action`

### Etape 3 — Creer les routes API manquantes
- `GET /api/actions` — liste publique (avec places restantes)
- `GET /api/actions/:id` — detail action + places

### Etape 4 — Simplifier le scraping
- `scripts/scrape-and-push.mjs` → push uniquement vers Supabase
- Supprimer `migrate-to-prismic.mjs`

### Etape 5 — Nettoyage
- Supprimer le custom type `action` de Prismic
- Supprimer les scripts de migration Prismic
- Supprimer le bridge `original_id`

---

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Perte de donnees pendant migration | Verifier que Supabase contient deja toutes les donnees avant de toucher Prismic |
| URLs cassees si changement de schema d'URL | Garder le meme pattern `/actions/:id` |
| Regression sur les inscriptions | Le flow inscription utilise deja `action_id` Supabase — zero changement |
| Latence sans CDN Prismic | ISR Nuxt + cache Vercel Edge couvrent le besoin |

---

## Recommendation finale

**Migrer les actions vers Supabase-only.**

Prismic reste pertinent pour : homepage (slices visuelles), actualites (contenu editorial), et potentiellement les ressources. Mais les actions sont des donnees operationnelles liees aux inscriptions — elles appartiennent a la base de donnees relationnelle.
