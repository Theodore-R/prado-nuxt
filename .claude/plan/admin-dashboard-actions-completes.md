# Plan : Admin Dashboard — Actions completes sur toutes les entites

## Contexte

Le dashboard admin actuel est principalement **read-only** sur la plupart des entites.
Ce plan ajoute des **actions CRUD completes** sur chaque entite : prescripteurs, structures, jeunes, inscriptions, actions, contacts et newsletter.

---

## Etat actuel vs Cible

| Entite | Actuel | Cible |
|--------|--------|-------|
| **Prescripteurs** | Liste + approuver/rejeter | + supprimer, voir detail (slide-over), changer structure, promouvoir/revoquer admin |
| **Structures** | CRUD + compteurs | + page detail avec onglets prescripteurs/jeunes, reassigner prescripteur, fusionner structures |
| **Jeunes** | Liste read-only | + voir detail (slide-over), editer champs, supprimer, changer structure, voir inscriptions/sante |
| **Inscriptions** | Liste read-only | + annuler inscription, filtres par action/structure/date, details expandable |
| **Actions** | places_max, archive, dupliquer | + editer titre/description/categorie, supprimer, voir inscrits, gestion dates enrichie |
| **Contacts** | Lire/non-lu + repondre | + supprimer message, supprimer en masse |
| **Newsletter** | Liste read-only | + desabonner, supprimer |
| **Dashboard** | 6 stat cards + activite | + carte structures, quick actions vers chaque section |

---

## Phase 1 : Prescripteurs — Actions completes

### 1.1 — API : Supprimer un prescripteur (admin)
**Fichier a creer:** `server/api/admin/prescripteurs.delete.ts`

```
POST /api/admin/prescripteurs (DELETE method)
Body: { id: string }
```

Logique (meme pattern que `delete-account.post.ts` mais par l'admin) :
1. `requireAdmin(event)`
2. Verifier que le prescripteur n'est pas admin (interdire auto-suppression d'admin)
3. Supprimer les inscriptions du prescripteur
4. Supprimer la ligne `prescripteurs`
5. Supprimer le user auth via `adminClient.auth.admin.deleteUser(id)`
6. Note : les jeunes ne sont PAS supprimes (ils appartiennent a la structure)

### 1.2 — API : Modifier prescripteur (enrichir le PATCH existant)
**Fichier a modifier:** `server/api/admin/prescripteurs.patch.ts`

Accepter en plus de `status` :
- `structure_id` — changer de structure
- `role` — promouvoir en admin ou revoquer (`admin` | `prescripteur`)

Validation :
- Un admin ne peut pas se revoquer lui-meme
- `structure_id` doit exister dans la table `structures`

### 1.3 — API : Detail prescripteur
**Fichier a creer:** `server/api/admin/prescripteurs/[id].get.ts`

Retourne le profil complet + :
- `structure` (join structures)
- `jeunes` (liste des jeunes qu'il a crees : `prescripteur_id = id`)
- `inscriptions_count` (nombre d'inscriptions faites par ce prescripteur)
- `last_activity` (derniere inscription ou connexion)

### 1.4 — Frontend : Enrichir `pages/admin/prescripteurs.vue`

Ajouter dans les actions de chaque ligne :
- **Icone Trash2** → suppression avec confirmation danger
- **Icone Eye** → ouvrir un slide-over/drawer avec le detail du prescripteur
- **Icone ArrowRightLeft** → modal pour changer de structure (dropdown des structures)
- **Icone Shield** → promouvoir/revoquer admin (avec confirmation)

Le **slide-over** detail affiche :
- Infos: nom, email, telephone, structure, role, statut, date creation
- Liste des jeunes crees (avec lien vers la fiche admin)
- Nombre d'inscriptions

---

## Phase 2 : Structures — Detail et gestion avancee

### 2.1 — API : Detail structure
**Fichier a creer:** `server/api/admin/structures/[id].get.ts`

Retourne :
- Nom, date creation
- Liste prescripteurs associes (id, name, email, status, role)
- Liste jeunes associes (id, first_name, last_name, situation, prescripteur_name)

### 2.2 — API : Reassigner prescripteur a une autre structure
Deja couvert par Phase 1.2 (PATCH prescripteurs avec `structure_id`).

Quand un prescripteur change de structure :
- Ses jeunes restent dans l'ancienne structure (pas de cascade)
- Message d'info a afficher

### 2.3 — API : Fusionner deux structures
**Fichier a creer:** `server/api/admin/structures/merge.post.ts`

```
Body: { sourceId: string, targetId: string }
```

1. Deplacer tous les prescripteurs de `sourceId` vers `targetId`
2. Deplacer tous les jeunes de `sourceId` vers `targetId`
3. Supprimer la structure source
4. Retourner la structure cible mise a jour

### 2.4 — Frontend : Page detail structure
**Fichier a creer:** `pages/admin/structures/[id].vue`

Page avec 2 onglets :
- **Prescripteurs** : table avec actions (changer structure, voir detail)
- **Jeunes** : table avec actions (voir detail, changer structure)

Header : nom structure (editable inline), compteurs, bouton "Fusionner avec..."

### 2.5 — Frontend : Enrichir `pages/admin/structures.vue`

- Rendre le nom de la structure cliquable → navigation vers `/admin/structures/[id]`
- Rendre les compteurs cliquables aussi
- Ajouter bouton "Fusionner" dans les actions (ouvre un modal avec dropdown de la structure cible)

---

## Phase 3 : Jeunes — CRUD complet

### 3.1 — API : Detail jeune (admin)
**Fichier a creer:** `server/api/admin/jeunes/[id].get.ts`

Retourne :
- Infos completes : first_name, last_name, date_of_birth, situation, postal_code, city, notes, address
- Structure (join structures)
- Prescripteur createur (join prescripteurs)
- Inscriptions (join actions via action_id → titre)
- Donnees sante si existantes (join jeune_sante) — champs anonymises si besoin

### 3.2 — API : Modifier jeune (admin)
**Fichier a creer:** `server/api/admin/jeunes/[id].patch.ts`

Champs modifiables :
- `first_name`, `last_name`, `date_of_birth`, `situation`, `postal_code`, `city`, `notes`
- `structure_id` — changer de structure
- `prescripteur_id` — reassigner a un autre prescripteur

### 3.3 — API : Supprimer jeune (admin)
**Fichier a creer:** `server/api/admin/jeunes/[id].delete.ts`

1. Supprimer les inscriptions du jeune
2. Supprimer la fiche sante (jeune_sante)
3. Supprimer le jeune

### 3.4 — Frontend : Enrichir `pages/admin/jeunes.vue`

Ajouter dans les actions :
- **Icone Eye** → slide-over avec detail complet
- **Icone Pencil** → modal edition des champs principaux
- **Icone Trash2** → suppression avec confirmation danger (affiche nb inscriptions qui seront supprimees)
- **Icone ArrowRightLeft** → changer de structure

Ajouter colonne **Structure** (jointure via `structure_id`).

Ajouter **filtres** :
- Par structure (dropdown)
- Par prescripteur
- Par situation

### 3.5 — API : Enrichir GET jeunes admin
**Fichier a modifier:** `server/api/admin/jeunes.get.ts`

Ajouter dans le select :
- `structure_id`
- `structures(name)` (join)
- `postal_code`, `city`

---

## Phase 4 : Inscriptions — Gestion active

### 4.1 — API : Annuler une inscription (admin)
**Fichier a creer:** `server/api/admin/inscriptions.patch.ts`

```
Body: { id: string, canceled_at: string | null }
```

Permet de mettre `canceled_at = now()` ou de re-activer (`canceled_at = null`).

### 4.2 — API : Supprimer une inscription (admin)
**Fichier a creer:** `server/api/admin/inscriptions.delete.ts`

Suppression definitive d'une inscription.

### 4.3 — Frontend : Enrichir `pages/admin/inscriptions.vue`

Ajouter dans les actions :
- **Icone XCircle** → annuler inscription (met canceled_at)
- **Icone RotateCcw** → re-activer si annulee
- **Icone Trash2** → supprimer definitivement

Ajouter **filtres** :
- Par structure (dropdown)
- Par action (dropdown)
- Par statut (active / annulee)
- Par date (plage)

Ajouter colonne **Statut** avec badge (active / annulee).
Ajouter colonne **Structure** si utile.

### 4.4 — API : Enrichir GET inscriptions admin
**Fichier a modifier:** `server/api/admin/inscriptions.get.ts`

Ajouter dans le select :
- `canceled_at` (si pas deja present)
- structure du prescripteur
- Titre de l'action (join via action_dates ou actions map)

---

## Phase 5 : Actions — Gestion enrichie

### 5.1 — API : Modifier action (enrichir le PATCH existant)
**Fichier a modifier:** `server/api/admin/actions.patch.ts`

Accepter en plus :
- `title` — renommer l'action
- `description` — modifier la description
- `category` — modifier la categorie
- `location` — modifier le lieu
- `is_activite` — changer le type
- `is_published` — publier/depublier

### 5.2 — API : Supprimer action (admin)
**Fichier a creer:** `server/api/admin/actions.delete.ts`

1. Verifier qu'il n'y a pas d'inscriptions actives (non annulees)
2. Supprimer les `action_dates` liees
3. Supprimer les inscriptions restantes (annulees)
4. Supprimer l'action

Si inscriptions actives → refuser avec message d'erreur explicite.

### 5.3 — API : Inscrits par action
**Fichier a creer:** `server/api/admin/actions/[id]/inscriptions.get.ts`

Retourne la liste des inscrits pour une action donnee :
- Jeune (first_name, last_name)
- Prescripteur (name)
- Date inscription
- Statut (active/annulee)

### 5.4 — Frontend : Enrichir `pages/admin/actions.vue`

Ajouter dans les actions :
- **Icone Pencil** → modal edition (titre, description, categorie, lieu, type)
- **Icone Trash2** → suppression avec confirmation (affiche nb inscrits)
- **Icone Users** → slide-over avec liste des inscrits
- **Icone Eye / EyeOff** → toggle publier/depublier

### 5.5 — Frontend : Modal edition action
Modal avec formulaire :
- Titre
- Description (textarea)
- Categorie (select)
- Lieu
- Type (activite planifiee / sur mesure)
- Places max (deja existant, deplacer ici)

---

## Phase 6 : Contacts — Actions de suppression

### 6.1 — API : Supprimer contact
**Fichier a creer:** `server/api/admin/contacts.delete.ts`

```
Body: { id: string } ou { ids: string[] } pour suppression en masse
```

### 6.2 — Frontend : Enrichir `pages/admin/contacts.vue`

Ajouter :
- **Icone Trash2** par message → suppression avec confirmation
- **Checkbox** sur chaque ligne → actions en masse (supprimer selection, marquer lu/non-lu)
- Barre d'actions en masse qui apparait quand >= 1 message selectionne

---

## Phase 7 : Newsletter — Actions de gestion

### 7.1 — API : Supprimer abonne newsletter
**Fichier a creer:** `server/api/admin/newsletter.delete.ts`

```
Body: { id: string } ou { ids: string[] }
```

### 7.2 — Frontend : Enrichir `pages/admin/newsletter.vue`

Ajouter :
- **Icone Trash2** par ligne → desabonner/supprimer
- **Checkbox** + actions en masse
- Filtres : par structure, par statut confirmation

---

## Phase 8 : Dashboard — Enrichissement

### 8.1 — Ajouter carte Structures au dashboard
**Fichier a modifier:** `pages/admin/index.vue`

Ajouter une 7e stat card : nombre de structures.
Modifier `server/api/admin/stats.get.ts` pour inclure `structuresCount` (deja present dans `adminApi.ts`).

### 8.2 — Quick actions
Ajouter une section "Actions rapides" sous les stats :
- "Prescripteurs en attente" → lien `/admin/prescripteurs?filter=pending`
- "Contacts non lus" → lien `/admin/contacts`
- "Ajouter une structure" → `/admin/structures` (+ ouvre modal)
- "Gerer les actions" → `/admin/actions`

---

## Composants partages a creer

### SlideOver (drawer lateral)
**Fichier a creer:** `components/admin/SlideOver.vue`

Drawer lateral (800px) qui s'ouvre par la droite, avec :
- Header avec titre + bouton fermer
- Corps scrollable
- Footer optionnel avec actions
- Animation slide-in/out
- Overlay backdrop cliquable

Utilise pour les details prescripteur, jeune, inscrits d'une action.

### BulkActions (barre d'actions en masse)
**Fichier a creer:** `components/admin/BulkActions.vue`

Barre flottante en bas qui apparait quand >= 1 item selectionne :
- Compteur "X selectionnes"
- Boutons d'actions (supprimer, marquer lu, etc.)
- Bouton "Tout deselectionner"

### FilterBar (filtres avances)
**Fichier a creer:** `components/admin/FilterBar.vue`

Barre de filtres horizontale avec :
- Dropdowns (structure, prescripteur, statut, etc.)
- Date range picker
- Bouton reset filtres
- Props generiques pour configuration par page

---

## Fichiers a creer (resume)

### API (server/api/admin/)

| Fichier | Methode | Description |
|---------|---------|-------------|
| `prescripteurs.delete.ts` | DELETE | Supprimer prescripteur + auth user |
| `prescripteurs/[id].get.ts` | GET | Detail prescripteur avec jeunes |
| `structures/[id].get.ts` | GET | Detail structure avec prescripteurs/jeunes |
| `structures/merge.post.ts` | POST | Fusionner deux structures |
| `jeunes/[id].get.ts` | GET | Detail jeune complet (admin) |
| `jeunes/[id].patch.ts` | PATCH | Modifier jeune (admin) |
| `jeunes/[id].delete.ts` | DELETE | Supprimer jeune + inscriptions + sante |
| `inscriptions.patch.ts` | PATCH | Annuler/re-activer inscription |
| `inscriptions.delete.ts` | DELETE | Supprimer inscription |
| `actions.delete.ts` | DELETE | Supprimer action |
| `actions/[id]/inscriptions.get.ts` | GET | Liste inscrits par action |
| `contacts.delete.ts` | DELETE | Supprimer contact(s) |
| `newsletter.delete.ts` | DELETE | Supprimer abonne(s) |

### Pages

| Fichier | Description |
|---------|-------------|
| `pages/admin/structures/[id].vue` | Detail structure avec onglets |

### Composants

| Fichier | Description |
|---------|-------------|
| `components/admin/SlideOver.vue` | Drawer lateral detail |
| `components/admin/BulkActions.vue` | Barre actions en masse |
| `components/admin/FilterBar.vue` | Filtres avances |

## Fichiers a modifier (resume)

| Fichier | Modifications |
|---------|--------------|
| `server/api/admin/prescripteurs.patch.ts` | + structure_id, role |
| `server/api/admin/jeunes.get.ts` | + structure join, postal_code, city |
| `server/api/admin/inscriptions.get.ts` | + canceled_at, structure info |
| `server/api/admin/actions.patch.ts` | + title, description, category, location, is_published |
| `server/api/admin/stats.get.ts` | + structuresCount dans la reponse |
| `pages/admin/prescripteurs.vue` | + actions (supprimer, detail, changer structure, admin) |
| `pages/admin/structures.vue` | + lien vers detail, fusionner |
| `pages/admin/jeunes.vue` | + actions CRUD, filtres, colonne structure |
| `pages/admin/inscriptions.vue` | + actions annuler/supprimer, filtres, statut |
| `pages/admin/actions.vue` | + actions edit/supprimer/inscrits/publier |
| `pages/admin/contacts.vue` | + supprimer, checkboxes, actions en masse |
| `pages/admin/newsletter.vue` | + supprimer, checkboxes, actions en masse |
| `pages/admin/index.vue` | + carte structures, quick actions |

---

## Ordre d'execution recommande

| # | Phase | Description | Prereq | Effort |
|---|-------|-------------|--------|--------|
| 1 | Composants | SlideOver, BulkActions, FilterBar | - | Moyen |
| 2 | Phase 1 | Prescripteurs actions completes | - | Fort |
| 3 | Phase 3 | Jeunes CRUD complet | - | Fort |
| 4 | Phase 2 | Structures detail et gestion | Phase 1 | Fort |
| 5 | Phase 4 | Inscriptions gestion active | - | Moyen |
| 6 | Phase 5 | Actions gestion enrichie | - | Moyen |
| 7 | Phase 6 | Contacts suppression | Composants | Faible |
| 8 | Phase 7 | Newsletter gestion | Composants | Faible |
| 9 | Phase 8 | Dashboard enrichi | - | Faible |

Les phases 2, 3, 5, 6 sont independantes et peuvent etre faites en parallele.

---

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Suppression prescripteur cascade | Les jeunes restent dans la structure, seules les inscriptions du prescripteur sont supprimees |
| Admin se supprime lui-meme | Interdire dans l'API (verifier `id !== auth.uid()` pour delete + role revoke) |
| Fusion structures perd des donnees | Transaction atomique + confirmation avec recap du merge |
| Suppression action avec inscrits | Refuser si inscriptions actives, forcer uniquement si toutes annulees |
| Performance tables volumineuses | Pagination cote serveur (pas encore necessaire, a monitorer) |
| Donnees sante sensibles | Afficher en lecture seule, limiter aux champs non-sensibles, pas d'export sante en CSV |

---

## Task Type
- [x] Frontend
- [x] Backend
- [x] Fullstack (Parallel)
