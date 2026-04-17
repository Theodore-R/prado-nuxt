---
type: concept
updated: 2026-04-17
---

# Déploiement et infrastructure

## URL cibles

| Env | URL |
|---|---|
| Production | `https://itineraires.le-prado.fr` (sous-domaine du domaine Prado existant) |
| Staging | URL preview Vercel auto par PR |
| Dev local | `http://localhost:3000` |
| Preview courant | `https://prado-nuxt.vercel.app` |

## Configuration à faire avant MEP

Lot 7 du devis (1 j / 600 €). Voir [[sources/devis-v2]].

| Service | Action | Responsable |
|---|---|---|
| **Domaine** | Créer enregistrement DNS sous `le-prado.fr` | Prado (DNS) + Théodore |
| **Cloudflare** | DNS + DDoS/WAF + CDN + SSL | Théodore |
| **Mailchimp** | Connecter l'API key du compte existant | Prado + Théodore |
| **Prismic** | Formation équipe Prado (Option A) | Théodore |
| **Email** | DNS pour `noreply@itineraires.le-prado.fr` | Prado + Théodore |
| **Microsoft Clarity** | Créer projet + intégrer script | Théodore |

## Infrastructure (tous au nom du client)

| Composant | Service |
|---|---|
| Code source | GitHub (privé) |
| Application | Vercel serverless |
| Protection réseau | Cloudflare |
| Base de données | Supabase (EU) |
| CMS | Prismic |
| Emails transactionnels | Resend |
| Newsletter | Mailchimp |

## Pipeline

```
Push sur main
  → GitHub Actions / Vercel CI
  → Tests (Vitest + Playwright)
  → Build Nuxt SSR
  → Déploiement Vercel prod (~2 min)
```

Preview URL pour chaque PR.

## Migration données ancien site

Voir §11 du [[sources/cahier-des-charges-v2]] :
- Actions, jeunes, prescripteurs, ressources, articles → import scripts dédiés.
- Abonnés newsletter → **pas de migration** (Mailchimp conservé).

Contenu déjà migré :
- **142 actions + 187 ressources** importées dans Prismic depuis scraping du site Prado original (cf. [[sources/session-handoff-homepage]]).
- Images locales dans `public/images/` (94 actions + 183 ressources).

## Tâches cron Vercel

| Tâche | Fréquence | Endpoint |
|---|---|---|
| Rappels d'actions | 08:00 quotidien | `GET /api/cron/send-reminders` |
| Archivage auto actions passées | 02:00 quotidien | `GET /api/cron/archive-actions` |

Sécurisés par `X-Cron-Secret`.
