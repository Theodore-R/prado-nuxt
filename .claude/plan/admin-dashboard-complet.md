# Plan : Dashboards Admin + Prescripteur

---

## PARTIE A — Espace Prescripteur (nouveau)

### Etat actuel
- Une seule page `/mon-compte` qui melange profil, jeunes et inscriptions
- Layout public (navbar + footer) → pas de contexte "dashboard"
- OnboardingChecklist creee mais jamais affichee
- Onboarding events jamais declenches (sauf profileCompleted)
- Liens actions casses (original_id au lieu de UID Prismic)
- Pas d'edition de profil ni de fiches jeunes
- Pas de confirmation avant suppression

### Architecture cible

```
pages/espace/
  index.vue              → Tableau de bord (stats, checklist, activite recente)
  jeunes/
    index.vue            → Liste des jeunes (table, recherche, ajout)
    [id].vue             → Fiche detaillee d'un jeune + inscriptions
  inscriptions.vue       → Vue consolidee de toutes les inscriptions
  profil.vue             → Edition profil complet + mot de passe
```

Layout : `layouts/espace.vue` (sidebar + header, meme pattern que admin.vue)
Middleware : `auth` (tout utilisateur authentifie)

### Phase A1 : Layout espace prescripteur

#### A1.1 — Creer `layouts/espace.vue`
Meme structure que `layouts/admin.vue` (sidebar + header + main slot), avec :
- Titre sidebar : "Mon espace"
- Couleur accent active : `#004657` (bleu-vert Prado)
- Items de navigation :

```ts
const navItems = [
  { to: '/espace', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/espace/jeunes', label: 'Mes jeunes', icon: Users, exact: false },
  { to: '/espace/inscriptions', label: 'Inscriptions', icon: ClipboardList, exact: false },
]

const secondaryItems = [
  { to: '/espace/profil', label: 'Mon profil', icon: UserCog, exact: false },
]

const externalItems = [
  { to: '/actions', label: 'Catalogue actions', icon: BookOpen, external: true },
  { to: '/', label: 'Voir le site', icon: Globe, external: true },
]
```

- Badges dans la sidebar :
  - "Mes jeunes" → nombre de jeunes
  - "Inscriptions" → nombre d'inscriptions actives

- Footer sidebar : bouton Deconnexion
- Header : nom utilisateur + lien rapide "Voir le site"
- Mobile : hamburger menu (meme pattern que admin)

#### A1.2 — Mettre a jour la navigation publique
**Fichier:** `layouts/default.vue`

Changer le lien "Mon compte" (icone User) pour pointer vers `/espace` au lieu de `/mon-compte`.

#### A1.3 — Redirect `/mon-compte` → `/espace`
**Fichier:** `pages/mon-compte.vue`

Remplacer le contenu par un simple redirect via `navigateTo('/espace')` pour ne pas casser les liens existants.

### Phase A2 : Tableau de bord prescripteur

#### A2.1 — Creer `pages/espace/index.vue`
**Contenu :**

1. **Banniere statut** (si pending/rejected) — meme banniere que l'actuel mon-compte
2. **OnboardingChecklist** — integrer le composant existant, appeler `loadFromStorage()` au mount
3. **Stats rapides** (3 cards) :
   - Nombre de jeunes
   - Inscriptions actives
   - Inscriptions ce mois
4. **Raccourcis** :
   - "Ajouter un jeune" → `/espace/jeunes?add=1`
   - "Parcourir les actions" → `/actions`
5. **Dernieres inscriptions** — liste des 5 dernieres inscriptions avec nom du jeune + action

#### A2.2 — Brancher les events onboarding
**Fichiers a modifier :**

| Event | Ou le declencher | Fichier |
|-------|-----------------|---------|
| `accountCreated` | Apres register ou magic link | `pages/connexion.vue` |
| `profileCompleted` | Deja fait | `components/onboarding/OnboardingStep2.vue` |
| `catalogVisited` | Au mount de la page actions | `pages/actions/index.vue` |
| `firstJeuneAdded` | Apres `addJeune()` reussi | `pages/espace/jeunes/index.vue` |
| `firstInscription` | Apres `inscrire()` reussi | `pages/actions/[id].vue` |

Appeler `loadFromStorage()` dans `pages/espace/index.vue` au mount.

### Phase A3 : Page Jeunes prescripteur

#### A3.1 — Creer `pages/espace/jeunes/index.vue`
**Table avec :**
- Nom complet
- Date de naissance
- Situation
- Nombre d'inscriptions actives
- Actions : Voir fiche, Modifier, Supprimer (avec confirmation)

**Fonctionnalites :**
- Recherche par nom
- Bouton "Ajouter un jeune" → formulaire inline ou modale
- Formulaire d'ajout identique a l'actuel (prenom, nom, date naissance, adresse, situation)
- Export CSV

#### A3.2 — Creer `pages/espace/jeunes/[id].vue`
**Fiche detaillee d'un jeune :**
- Informations completes (nom, date naissance, adresse, situation)
- **Edition inline** de chaque champ (clic → input → save)
- Liste des inscriptions de ce jeune avec :
  - Nom de l'action (lien vers `/actions/{uid}` — corrige le bug actuel)
  - Date d'inscription
  - Bouton desinscription (avec confirmation)
- Bouton "Inscrire a une action" → picker d'actions disponibles

#### A3.3 — API pour update jeune
**Fichier:** `lib/api.ts`

Ajouter `updateJeune(client, id, data)` — update partiel des champs modifiables.

**Fichier:** `composables/useAuth.ts`

Ajouter `editJeune(id, data)` qui appelle `updateJeune` et met a jour le state local.

### Phase A4 : Page Inscriptions prescripteur

#### A4.1 — Creer `pages/espace/inscriptions.vue`
**Vue consolidee :**
- Table de toutes les inscriptions du prescripteur
- Colonnes : Jeune, Action, Date inscription, Statut
- Le nom de l'action utilise le **UID Prismic** pour le lien (corrige le bug)
- Filtre par jeune (dropdown)
- Filtre par periode (date range)
- Bouton desinscription (avec confirmation)
- Export CSV

**Donnees :** Reutilise `useAuth().inscriptions` + jointure avec les actions Prismic (meme pattern que l'actuel mon-compte mais avec le UID).

### Phase A5 : Page Profil

#### A5.1 — Creer `pages/espace/profil.vue`
**Sections :**

1. **Informations personnelles** (formulaire editable) :
   - Nom complet
   - Email (lecture seule)
   - Structure
   - Fonction
   - Telephone
   - Bouton "Enregistrer les modifications"

2. **Securite** :
   - Changement de mot de passe (reprendre le formulaire existant)

3. **Compte** :
   - Statut du compte (badge : approuve / en attente / rejete)
   - Date de creation du compte

#### A5.2 — API pour update profil
**Fichier:** `composables/useAuth.ts`

Ajouter `updateProfile(data)` qui :
1. Appelle `client.auth.updateUser({ data })` pour les metadata Supabase
2. Appelle une route serveur `/api/update-profile` pour mettre a jour la table `prescripteurs`
3. Recharge le profil local

**Fichier:** `server/api/update-profile.post.ts` (nouveau)
- Authentifie via Supabase
- Met a jour `prescripteurs` (name, structure, phone, fonction)

### Phase A6 : Composants partages

#### A6.1 — Creer `components/ui/ConfirmDialog.vue`
Modal de confirmation reutilisable (admin + prescripteur) :
```ts
const { confirm } = useConfirm()
const ok = await confirm('Supprimer cette fiche ?', { variant: 'danger' })
```

#### A6.2 — Creer `composables/useConfirm.ts`
Composable qui gere l'etat du dialog + retourne une Promise<boolean>.

#### A6.3 — Creer `components/ui/DataTable.vue`
Table reutilisable partagee entre admin et prescripteur :
- Recherche, tri, pagination
- Slots pour cellules custom
- Skeleton loading
- Etat vide configurable

Remplace le precedent `AdminTable.vue` — le composant est dans `ui/` car partage.

---

## PARTIE B — Dashboard Admin (corrections + ameliorations)

### Phase B1 : Corrections critiques

#### B1.1 — Fix layout des 3 pages
**Fichiers:** `pages/admin/contacts.vue`, `pages/admin/newsletter.vue`, `pages/admin/actions.vue`

Remplacer `definePageMeta({ middleware: ['auth', 'admin'] })` par `definePageMeta({ layout: 'admin', middleware: 'admin' })`.

Supprimer le padding redondant (`px-6 py-10 max-w-6xl mx-auto`) — le layout admin gere deja le spacing.

#### B1.2 — Completer la sidebar admin
**Fichier:** `layouts/admin.vue`

```ts
const navItems = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/admin/prescripteurs', label: 'Prescripteurs', icon: Users },
  { to: '/admin/jeunes', label: 'Jeunes', icon: UserCheck },
  { to: '/admin/inscriptions', label: 'Inscriptions', icon: ClipboardList },
  { to: '/admin/contacts', label: 'Contacts', icon: Mail },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Newspaper },
  { to: '/admin/actions', label: 'Actions', icon: Settings },
]
```

Ajouter badges : prescripteurs pending + contacts non lus.

Ajouter "Voir le site" en bas de sidebar (meme pattern que espace).

### Phase B2 : Dashboard admin enrichi

#### B2.1 — API stats consolidees
**Fichier:** `server/api/admin/stats.get.ts` (nouveau)

Retourne en un seul appel :
- prescripteursCount, pendingCount
- jeunesCount
- inscriptionsCount
- contactsUnreadCount
- newsletterCount

#### B2.2 — API activite recente
**Fichier:** `server/api/admin/activity.get.ts` (nouveau)

Union des 10 derniers evenements (inscriptions, prescripteurs, contacts, newsletter) tries par date DESC.

#### B2.3 — Refonte `pages/admin/index.vue`
- 6 stat cards (ajouter contacts non lus + newsletter)
- Timeline activite recente
- Quick actions enrichies

### Phase B3 : Page Jeunes admin

#### B3.1 — Creer `pages/admin/jeunes.vue`
Table avec : nom, date naissance, situation, prescripteur (jointure), nb inscriptions, date creation.

#### B3.2 — API jeunes admin
**Fichier:** `server/api/admin/jeunes.get.ts` (nouveau)

Fetch tous les jeunes avec jointure prescripteurs.

### Phase B4 : Migration DataTable + ameliorations

#### B4.1 — Migrer les 6 pages admin vers DataTable
Refactorer prescripteurs, inscriptions, contacts, newsletter, actions, jeunes pour utiliser `components/ui/DataTable.vue`.

#### B4.2 — Export CSV uniforme
Ajouter export sur contacts et jeunes (les autres l'ont deja).

#### B4.3 — Badges sidebar
**Fichier:** `composables/useAdminCounts.ts` (nouveau)

Fetch periodique des counts pour les badges (prescripteurs pending, contacts non lus).

---

## Ordre d'execution global

| # | Phase | Quoi | Prereq |
|---|-------|------|--------|
| 1 | A6 | Composants partages (ConfirmDialog, DataTable, useConfirm) | - |
| 2 | A1 | Layout espace + redirect mon-compte + nav publique | - |
| 3 | B1 | Fix layout admin + sidebar complete | - |
| 4 | A2 | Tableau de bord prescripteur + onboarding | A1 |
| 5 | A3 | Pages jeunes prescripteur (liste + detail + edit) | A1, A6 |
| 6 | A4 | Page inscriptions prescripteur | A1, A6 |
| 7 | A5 | Page profil prescripteur | A1 |
| 8 | B2 | Dashboard admin enrichi (stats + activite) | B1 |
| 9 | B3 | Page jeunes admin | B1, A6 |
| 10 | B4 | Migration DataTable admin + badges | A6, B1 |

Les phases 1-3 sont independantes et peuvent etre faites en parallele.
Les phases 4-7 (espace prescripteur) et 8-10 (admin) sont aussi independantes entre elles.

---

## Fichiers a creer

| Fichier | Description |
|---------|-------------|
| `layouts/espace.vue` | Layout sidebar prescripteur |
| `pages/espace/index.vue` | Tableau de bord prescripteur |
| `pages/espace/jeunes/index.vue` | Liste jeunes |
| `pages/espace/jeunes/[id].vue` | Detail + edition jeune |
| `pages/espace/inscriptions.vue` | Inscriptions consolidees |
| `pages/espace/profil.vue` | Edition profil |
| `pages/admin/jeunes.vue` | Jeunes admin |
| `components/ui/DataTable.vue` | Table reutilisable |
| `components/ui/ConfirmDialog.vue` | Modal confirmation |
| `composables/useConfirm.ts` | Composable confirmation |
| `composables/useAdminCounts.ts` | Badges sidebar admin |
| `server/api/admin/stats.get.ts` | Stats consolidees |
| `server/api/admin/activity.get.ts` | Activite recente |
| `server/api/admin/jeunes.get.ts` | Liste jeunes admin |
| `server/api/update-profile.post.ts` | Update profil prescripteur |

## Fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `layouts/default.vue` | Lien Mon compte → `/espace` |
| `layouts/admin.vue` | Sidebar complete + badges + "Voir le site" |
| `pages/mon-compte.vue` | Redirect vers `/espace` |
| `pages/admin/contacts.vue` | Fix layout + DataTable |
| `pages/admin/newsletter.vue` | Fix layout + DataTable |
| `pages/admin/actions.vue` | Fix layout + DataTable |
| `pages/admin/index.vue` | Dashboard enrichi |
| `pages/admin/prescripteurs.vue` | DataTable |
| `pages/admin/inscriptions.vue` | DataTable |
| `pages/connexion.vue` | Trigger `accountCreated` |
| `pages/actions/index.vue` | Trigger `catalogVisited` |
| `pages/actions/[id].vue` | Trigger `firstInscription` |
| `composables/useAuth.ts` | Ajouter `editJeune()` + `updateProfile()` |
| `lib/api.ts` | Ajouter `updateJeune()` |

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Redirect `/mon-compte` casse des bookmarks | Redirect 302 transparent, pas de suppression |
| RLS bloque les requetes admin client-side | Migrer vers routes serveur avec `requireAdmin()` |
| Performance tables si beaucoup de donnees | Pagination dans DataTable (25/page) |
| Liens actions casses (original_id vs UID) | Stocker le UID Prismic dans le mapping inscriptions |
| Coherence visuelle espace vs admin | Meme composant DataTable, memes variables CSS |
