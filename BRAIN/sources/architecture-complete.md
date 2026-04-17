---
type: source
updated: 2026-04-17
source: ../../docs/architecture-complete.md
---

# Source — Architecture complète (diagrammes)

**Document** : `docs/architecture-complete.md`
**Nature** : document technique avec 8 diagrammes Mermaid détaillés.

## Contenu

1. **Vue d'ensemble** — visiteurs/prescripteurs/admin vers les 3 espaces.
2. **API routes** — mapping des endpoints `/api/*` (publiques, authentifiées, Veriff, admin, cron).
3. **Base de données** — ER diagram détaillé.
4. **Droits d'accès** — matrice visiteur / pending / approved / admin + RLS + middleware.
5. **Services externes** — Supabase / Prismic / Veriff / Resend / Geoplateforme.
6. **Flux d'authentification** — séquence signup/signin.
7. **Flux d'inscription jeune à action** — séquence avec vérif capacité.
8. **Flux Veriff** — séquence de vérification d'identité (scope retiré V1).

## Statut

⚠️ Document **reflet de la PRD** (inclut Veriff, `jeune_sante`). À actualiser quand les ajustements client seront pleinement intégrés au code.

## Endpoints documentés (état V1 technique)

### Publiques (sans auth)
- `GET /api/actions`, `/api/actions/map`, `/api/actions/:id`
- `POST /api/contact`
- `POST /api/newsletter`, `GET /api/newsletter/confirm`
- `POST /api/check-email`

### Authentifiées (JWT user)
- `POST /api/complete-profile`, `POST /api/update-profile`
- `POST /api/delete-account`, `GET /api/export-data`
- `GET/PUT /api/jeunes/:id/sante` *(à retirer — santé supprimée)*
- `PUT /api/jeunes/:id`

### Veriff *(retirée V1)*
- `POST /api/veriff/session`
- `POST /api/webhooks/veriff` (HMAC-SHA256)

### Admin (Service Role)
- `GET /api/admin/stats`, `/api/admin/activity`
- `GET/POST/PATCH /api/admin/actions`
- `GET/PATCH /api/admin/prescripteurs`
- `GET /api/admin/jeunes`, `/api/admin/inscriptions`
- `GET/PATCH /api/admin/contacts`
- `GET /api/admin/newsletter`

### Cron (X-Cron-Secret)
- `GET /api/cron/archive-actions`
- `GET /api/cron/send-reminders`

## Voir aussi

- [[concepts/tech-stack]]
- [[concepts/modele-donnees]]
- [[concepts/auth-flow]]
- [[concepts/rls-isolation]]
