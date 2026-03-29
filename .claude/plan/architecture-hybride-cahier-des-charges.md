# Plan d'architecture : Cahier des charges Prado Itinéraires

## Architecture retenue : HYBRIDE (Prismic + Supabase + Admin custom)

### Principe de séparation

| Couche | Outil | Responsabilité |
|--------|-------|---------------|
| **Contenu éditorial** | Prismic | Pages, blog, catalogue textes/images, PDFs, SEO, réseaux sociaux |
| **Données transactionnelles** | Supabase | Users, jeunes, inscriptions, places, contacts, newsletter |
| **Interface d'administration** | Pages Nuxt `/admin/` | Dashboard, gestion users, exports, places, contacts |
| **Logique serveur** | API Routes Nuxt `/server/api/` | Emails, cron, soumissions formulaires |

---

## Fonctionnalités manquantes par priorité

### P0 — Critique

#### 1. Emails automatiques (Resend + Vercel Cron)
- **Confirmation inscription** : email envoyé à la création d'une inscription
- **Rappel J-2** : cron quotidien vérifiant les inscriptions à J+2 → envoi email
- **Rappel J-1** : idem à J+1
- **Stack** : Resend (gratuit jusqu'à 100/jour), templates HTML inline
- **Fichiers** :
  - `server/api/send-confirmation.post.ts`
  - `server/api/cron/send-reminders.ts` (Vercel Cron)
  - `server/utils/email.ts` (client Resend partagé)

#### 2. Places restantes par action
- **Supabase** : ajouter `places_max` (nullable) sur table `actions` ou custom type Prismic
- **Affichage** : compteur en temps réel sur chaque carte action
  - `inscriptions_count` = COUNT inscriptions non annulées
  - `places_remaining` = `places_max - inscriptions_count`
  - Badge "Complet" si `places_remaining <= 0`
- **Fichiers** :
  - Migration Supabase (alter table actions)
  - `composables/useActionPlaces.ts`
  - Mise à jour `pages/actions/index.vue` et `pages/actions/[id].vue`

### P1 — Important

#### 3. Formulaire de contact fonctionnel
- **API route** : `server/api/contact.post.ts`
- **Table Supabase** : `contacts` (name, email, subject, message, created_at, is_read)
- **Email notification** : envoi Resend à l'équipe Prado
- **Admin** : page `/admin/contacts.vue` pour consulter les messages

#### 4. Newsletter fonctionnelle
- **API route** : `server/api/newsletter.post.ts`
- **Table Supabase** : `newsletter_subscribers` (email, subscribed_at, unsubscribed_at)
- **Double opt-in** : email de confirmation avec lien de validation
- **Admin** : export CSV des abonnés

#### 5. Page actualités / blog
- **Custom type Prismic** : `actualite` (déjà existant)
- **Pages** :
  - `pages/actualites/index.vue` — liste paginée avec filtres
  - `pages/actualites/[uid].vue` — article complet
- **SEO** : meta tags dynamiques depuis Prismic

#### 6. RGPD
- **Cookie banner** : composant `CookieBanner.vue` (accepter/refuser analytics)
- **Pages** :
  - `pages/mentions-legales.vue`
  - `pages/politique-confidentialite.vue`
- **Consentement stocké** : localStorage + respect dans analytics

### P2 — Secondaire

#### 7. Documents PDF téléchargeables
- **Prismic Media Library** : uploader les PDFs (catalogue, rapports)
- **Custom type ou slice** : `document` avec champ Link Media
- **Composant** : `DocumentDownload.vue` avec icône PDF + taille fichier

#### 8. Liens réseaux sociaux
- **Prismic** : ajouter des champs Link au custom type `homepage` ou créer un Single Type `settings`
- **Footer** : afficher les liens dynamiquement

#### 9. Admin enrichi
- **`/admin/actions.vue`** : gérer `places_max` par action
- **`/admin/contacts.vue`** : lire les messages, marquer comme lu
- **`/admin/newsletter.vue`** : liste abonnés + export CSV

---

## Stack technique complète

```
Frontend:  Nuxt 3 + Vue 3 + Tailwind CSS
CMS:       Prismic (contenu éditorial)
Database:  Supabase PostgreSQL (données transactionnelles)
Auth:      Supabase Auth (magic links + password)
Email:     Resend (transactionnel) via API routes Nuxt
Cron:      Vercel Cron Jobs (rappels J-2/J-1)
Deploy:    Vercel (SSR + edge functions)
Analytics: Microsoft Clarity (existant via MCP)
```

---

## Pourquoi PAS tout dans Prismic ?

| Besoin | Prismic peut ? | Problème |
|--------|---------------|----------|
| Édition contenu | ✅ Oui | — |
| Gestion utilisateurs | ❌ Non | Pas de BDD relationnelle |
| Inscriptions temps réel | ❌ Non | Pas de mutations |
| Compteur places | ❌ Non | Pas de computed fields |
| Envoi emails | ❌ Non | Pas de webhooks sortants fiables |
| Export CSV | ❌ Non | Pas d'accès SQL |
| Rôles admin | ❌ Non | Auth basique seulement |

## Pourquoi PAS tout dans un admin custom ?

| Besoin | Admin custom peut ? | Problème |
|--------|-------------------|----------|
| Édition contenu riche | ⚠️ Complexe | Il faudrait un éditeur WYSIWYG, gestion images, preview... |
| Blog/actualités | ⚠️ Long | Recréer un CMS entier |
| SEO fields | ⚠️ Long | UI complexe pour OG images, meta, etc. |
| Gestion données | ✅ Oui | — |

## Conclusion

**L'approche hybride est la seule qui couvre 100% du cahier des charges** sans recréer un CMS (Prismic le fait déjà bien) ni abandonner les capacités transactionnelles (Supabase excelle ici). L'admin custom existant est déjà bien avancé et n'a besoin que d'enrichissements ciblés.
