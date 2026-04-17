---
type: concept
updated: 2026-04-17
---

# Stack technique

## Frontend

| Techno | Version | Rôle |
|---|---|---|
| **Nuxt 3** | 3.21+ | Framework SSR/SSG — pages, layouts, server routes `/api/*` |
| **Vue 3** | 3.5+ | Composition API, `<script setup lang="ts">` |
| **Tailwind CSS 4** | 4.1+ | Styling utilitaire. `@tailwindcss/vite`. Tokens dans `assets/css/theme.css` |
| **Lucide Vue Next** | 0.487+ | Icônes sémantiques |
| **GSAP** | 3.14+ | Animations scroll, transitions |
| **Vue Sonner** | 1.3+ | Toasts |
| **Zod** | 3.25+ | Validation schémas |

Package maison publié sur npm : **`@theodoreriant/prado-ui`** (0.1.0), composants extraits du projet pour réutilisation.

## Backend & services

| Service | Rôle | Hébergement | Auth flow |
|---|---|---|---|
| **Supabase** | Auth + PostgreSQL + RLS + Storage | Cloud EU | JWT utilisateur côté client, Service Role côté serveur |
| **Prismic** | CMS headless | Cloud | — |
| **Resend** | Emails transactionnels | Cloud EU | API key serveur |
| **Mailchimp** | Newsletter et campagnes | Cloud | API key serveur |
| **Cloudflare** | Anti-DDoS, WAF, CDN, SSL, DNS | Cloud (mondial) | — |
| **Vercel** | Hébergement serverless, cron jobs | Cloud | — |
| **Microsoft Clarity** | Analytics comportementales anonymes | Cloud | — |
| **API Geoplateforme (BAN)** | Autocomplétion adresses FR (gratuit, sans clé) | Gouv FR | — |

**Ajout prévu V2 / retiré V1** : **Veriff** (KYC/IDV des jeunes) — retiré du scope V1, module indépendant réintégrable en V2.

## Repo et CI/CD

- Code sur **GitHub** (dépôt privé) — `TheodoreRiant/prado-nuxt`.
- CI/CD : push sur `main` → déploiement automatique Vercel. Chaque PR génère une URL de preview.
- Tests : **Vitest** (unit) + **Playwright** (E2E).
- Préset Nuxt : Vercel SSR.

## Cron jobs (Vercel)

| Tâche | Fréquence | Endpoint |
|---|---|---|
| Rappels d'actions (J-1 / J-2) | Tous les jours à 8h | `GET /api/cron/send-reminders` |
| Archivage automatique des actions passées | Tous les jours à 2h | `GET /api/cron/archive-actions` |

Sécurisés par header `X-Cron-Secret`.

## Domaine et emails

- **Production** : `itineraires.le-prado.fr` (sous-domaine du domaine Prado existant).
- **Staging** : preview Vercel auto par PR.
- **Local** : `http://localhost:3000`.
- **Emails** : adresse d'envoi `Prado Itinéraires <noreply@itineraires.le-prado.fr>`, contact à `itineraires@le-prado.fr`.

## Règle clé

Tous les services sont **au nom du client** (Association Le Prado) après configuration initiale par Théodore. Facturation directe fournisseur → client. Voir [[concepts/couts-recurrents]].
