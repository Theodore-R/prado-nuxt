# Plan d'implémentation — Paramètres Admin

## Vue d'ensemble

Page `/admin/parametres` avec des sections claires pour configurer les **intégrations externes** et les **paramètres opérationnels** qui changent dans le temps. Destinée à un utilisateur non-technique (équipe Prado).

Stockage : table Supabase `app_settings` (clé/valeur JSON), cache serveur 60s.

---

## Architecture

### Table Supabase `app_settings`

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM prescripteurs WHERE id = auth.uid() AND role = 'admin')
  );
```

### API Endpoints

| Endpoint | Méthode | Rôle |
|----------|---------|------|
| `/api/admin/settings` | GET | Lire tous les paramètres |
| `/api/admin/settings` | PATCH | Mettre à jour un ou plusieurs paramètres |
| `/api/admin/settings/test-email` | POST | Envoyer un email de test |
| `/api/admin/settings/test-mailchimp` | POST | Tester la connexion Mailchimp |
| `/api/admin/settings/sync-newsletter` | POST | Synchroniser les abonnés vers Mailchimp |

### Helpers

- `composables/useAdminSettings.ts` — fetch, save avec toast
- `server/utils/settings.ts` — cache mémoire + `getSettings(key)` / `invalidateSettings(key)`

---

## Sections de la page

### 1. Email & Notifications

**Clé DB:** `email`

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `senderName` | string | `"Prado Itinéraires"` | Nom expéditeur |
| `senderEmail` | string | `"noreply@prado-itineraires.fr"` | Adresse d'envoi |
| `replyToEmail` | string | `""` | Adresse de réponse (optionnel) |
| `reminderJ1Enabled` | boolean | `true` | Rappels J-1 actifs |
| `reminderJ2Enabled` | boolean | `true` | Rappels J-2 actifs |

**UI:**
- Inputs expéditeur + reply-to
- Toggles rappels J-1 / J-2 (libellé clair : "Envoyer un rappel la veille", "Envoyer un rappel 2 jours avant")
- Bouton **"Envoyer un email de test"** → envoie à l'adresse de l'admin connecté

**Impact code:**
- `server/utils/email.ts` : `DEFAULT_FROM` → `getSettings('email')` dynamique
- `server/api/cron/send-reminders.ts` : vérifier les toggles avant envoi

---

### 2. Newsletter & Mailchimp

**Clé DB:** `newsletter`

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `mailchimpEnabled` | boolean | `false` | Activer la sync Mailchimp |
| `mailchimpApiKey` | string (chiffré) | `""` | Clé API |
| `mailchimpListId` | string | `""` | ID de l'audience |
| `mailchimpServer` | string | `""` | Préfixe serveur (ex: `us21`) |
| `lastSyncAt` | string (readonly) | `null` | Dernière sync |
| `syncCount` | number (readonly) | `0` | Abonnés synchronisés |

**UI:**
- Toggle "Synchroniser avec Mailchimp"
- Si activé : champs clé API (masqué), audience ID, serveur
- Aide contextuelle : "Trouvez votre clé API dans Mailchimp → Account → API Keys"
- Bouton **"Tester la connexion"** → affiche le nom de la liste + nb contacts si OK, message d'erreur clair sinon
- Bouton **"Synchroniser maintenant"** → pousse tous les `newsletter_subscribers` confirmés
- Badge "Dernière sync : il y a X heures — Y abonnés"

**Impact code:**
- Nouveau `server/utils/mailchimp.ts` (client + sync batch)
- `server/api/newsletter.post.ts` : sync auto vers Mailchimp après confirmation si activé
- Package : `@mailchimp/mailchimp_marketing`

---

### 3. Vérification d'identité (Veriff)

**Clé DB:** `veriff`

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `enabled` | boolean | `true` | Activer Veriff |

**UI:**
- Toggle "Vérification d'identité active"
- Indicateur de statut : pastille verte/rouge (test API au chargement)
- Mini dashboard readonly : 3 compteurs calculés depuis la table `jeunes`
  - Vérifiés (count `identity_verified = true`)
  - En attente (count `veriff_session_id IS NOT NULL AND identity_verified = false`)
  - Non vérifiés (count `veriff_session_id IS NULL`)
- Note : "Les clés API sont configurées par le développeur dans les variables d'environnement"

**Impact code:**
- `server/api/veriff/session.post.ts` : vérifier `enabled` avant de créer une session, erreur claire si désactivé
- Endpoint `/api/admin/settings/veriff-stats` pour les compteurs

---

### 4. CMS (Prismic)

Pas de paramètres modifiables — **section informative** uniquement.

**UI:**
- Pastille statut connexion (test fetch au chargement)
- Lien **"Ouvrir le dashboard Prismic →"** (nouvelle fenêtre)
- Liste des types de contenu : Homepage, Actualités, Éducolab, Foodtruck, Fresque, Pages légales
- Note : "Pour modifier le contenu du site, utilisez le dashboard Prismic"

**Impact code:**
- Endpoint `/api/admin/settings/prismic-status` : vérifie la connexion, retourne les types disponibles

---

### 5. Analytics (Clarity)

**Clé DB:** `analytics`

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `clarityEnabled` | boolean | `false` | Activer Clarity |
| `clarityProjectId` | string | `""` | ID du projet |

**UI:**
- Toggle "Activer Microsoft Clarity"
- Input project ID (avec aide : "Trouvez l'ID dans Clarity → Settings → Overview")
- Lien **"Ouvrir le dashboard Clarity →"** si activé
- Note : "Données de navigation anonymisées, conforme à la politique de confidentialité"

**Impact code:**
- Plugin client `plugins/clarity.client.ts` : injecte le script Clarity dynamiquement si activé
- Ou `useScriptClarity` (Nuxt Scripts) avec config dynamique

---

### 6. Informations de contact

**Clé DB:** `contact`

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `contactEmail` | string | `""` | Email affiché sur /contact |
| `contactPhone` | string | `""` | Téléphone affiché sur /contact |
| `address` | string | `""` | Adresse physique |
| `donationUrl` | string | `"https://www.le-prado.fr/don/"` | Lien "Faire un don" |

**UI:**
- Formulaire simple, champs pré-remplis
- Preview : "Ces informations sont affichées sur la page Contact et dans le pied de page"

**Impact code:**
- `/pages/contact.vue` et `layouts/default.vue` (footer) : lire les valeurs depuis un composable qui fetch `/api/settings/public` (pas besoin d'auth admin pour la lecture publique)
- Endpoint `/api/settings/public` (GET, pas de RLS, lecture seule des clés publiques)

---

## Structure des fichiers

```
pages/admin/parametres.vue                # Page avec navigation par sections
components/admin/settings/
  SettingsEmail.vue                       # Email & notifications
  SettingsNewsletter.vue                  # Mailchimp
  SettingsVeriff.vue                      # Vérification identité
  SettingsPrismic.vue                     # CMS (readonly)
  SettingsAnalytics.vue                   # Clarity
  SettingsContact.vue                     # Infos de contact
composables/useAdminSettings.ts           # Fetch/save settings
server/utils/settings.ts                  # Cache serveur + helpers
server/utils/mailchimp.ts                 # Client Mailchimp
server/api/admin/settings.get.ts          # GET paramètres (admin)
server/api/admin/settings.patch.ts        # PATCH paramètres (admin)
server/api/admin/settings/
  test-email.post.ts                      # Envoi email de test
  test-mailchimp.post.ts                  # Test connexion Mailchimp
  sync-newsletter.post.ts                 # Sync Mailchimp
  prismic-status.get.ts                   # Statut Prismic
  veriff-stats.get.ts                     # Compteurs Veriff
server/api/settings/
  public.get.ts                           # Lecture publique (contact, donation)
supabase/migrations/
  20260328200000_create_app_settings.sql  # Table app_settings
```

---

## Étapes d'implémentation

### Phase 1 : Fondations
1. Migration Supabase `app_settings`
2. `server/utils/settings.ts` — cache + helpers
3. `server/api/admin/settings.get.ts` + `settings.patch.ts`
4. `composables/useAdminSettings.ts`
5. `pages/admin/parametres.vue` — layout avec nav par sections
6. Ajouter "Paramètres" dans la sidebar (`layouts/admin.vue`, icône Settings)

### Phase 2 : Sections
7. `SettingsEmail.vue` + `test-email.post.ts` — refactor `email.ts`
8. `SettingsContact.vue` + `server/api/settings/public.get.ts`
9. `SettingsNewsletter.vue` + `mailchimp.ts` + install package + endpoints test/sync
10. `SettingsVeriff.vue` + `veriff-stats.get.ts` — toggle + compteurs
11. `SettingsPrismic.vue` + `prismic-status.get.ts` — info connexion
12. `SettingsAnalytics.vue` + `plugins/clarity.client.ts`

### Phase 3 : Intégration
13. Refactor `cron/send-reminders.ts` pour lire les toggles email
14. Refactor `newsletter.post.ts` pour sync Mailchimp auto
15. Refactor `contact.vue` et footer pour lire les infos depuis settings

---

## Dépendance

```bash
npm install @mailchimp/mailchimp_marketing
npm install -D @types/mailchimp__mailchimp_marketing
```

---

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Clé API Mailchimp en DB | Chiffrer avec `crypto.createCipheriv`, déchiffrer côté serveur uniquement |
| Cache désynchronisé | TTL 60s + invalidation après PATCH |
| Performance | Cache mémoire serveur, pas de requête DB à chaque page load |
| Mailchimp rate limit | Batch API pour la sync, pas de sync temps réel |
