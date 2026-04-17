---
type: concept
updated: 2026-04-17
---

# Modèle de données

Base PostgreSQL hébergée sur Supabase (EU). Isolation par [[concepts/rls-isolation|Row Level Security]].

## Tables principales

### `organismes`
Structures prescriptrices (Prado + partenaires).

| Col | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Nom de la structure |
| `is_prado` | boolean | Structure interne Prado ou partenaire externe |
| `type` | text | MECS, Foyer, Service, Mission Locale… |
| `postal_code` | text | |
| `city` | text | |

### `etablissements`
Lieux d'accueil des actions. **Différent** des organismes.

| Col | Type |
|---|---|
| `id` | uuid PK |
| `name` | text |
| `address`, `postal_code`, `city` | text |

### `prescripteurs`
Clé `id` = `auth.users.id` (Supabase Auth).

| Col | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Prénom + Nom |
| `professional_email` | text | |
| `organisme_id` | uuid FK | Rattachement à l'organisme |
| `phone` | text | |
| `role` | enum | `prescripteur` \| `admin` |
| `status` | enum | `pending` \| `approved` \| `rejected` |

### `jeunes`
Scope V1 **simplifié** après demandes client (1 avril 2026).

| Col | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `prescripteur_id` | uuid FK | Créé par |
| `organisme_id` | uuid FK | Organisme de rattachement (isolation RLS) |
| `first_name`, `last_name` | text | |
| `date_of_birth` | date | |
| `sex` | enum | `homme` \| `femme` (utile pour stats) |
| `postal_code` | text | **Pas d'adresse exacte** (retiré par demande client) |
| `is_qpv` | boolean | Quartier Prioritaire Ville, déclaratif |
| `situation` | enum | `sans_emploi` \| `scolarise` \| `emploi_formation` \| `scolarise_medico_social` \| `autre` |
| `accompagnement_type` | text (multi) | ASE, PJJ, Handicap, décrochage, RSJ, CEJ, Autre |
| `notes` | text | Notes internes du prescripteur |

> **Retiré** : `jeune_sante`, `jeune_famille` (fiches santé et situation familiale) + champs `address`, `city`. Voir [[sources/echange-client-2026-04-01]]. Plus de besoin d'[[concepts/hds-historique|hébergement HDS]].

### `actions`

| Col | Type | Description |
|---|---|---|
| `id` | bigint PK | |
| `title` | text | |
| `category` | text | Programme ou catégorie |
| `date` | date | Date de l'occurrence |
| `description` | text | |
| `etablissement_id` | uuid FK | Lieu |
| `places_max` | integer | Null = illimité |
| `cost` | decimal | Coût total de l'action en € (admin seulement, [[concepts/module-budget|module budget]]) |
| `is_published` | boolean | Visible dans le catalogue |
| `is_recurring` | boolean | Action récurrente |
| `archived_at` | timestamptz | Archivage auto nocturne |

**Récurrence** : série d'occurrences, gestion individuelle (annulation, exception). Voir [[concepts/actions-recurrentes]].

### `inscriptions`

| Col | Type | Description |
|---|---|---|
| `id` | uuid PK | |
| `prescripteur_id` | uuid FK | Qui a inscrit |
| `jeune_id` | uuid FK | |
| `action_id` | bigint FK | |
| `accompagnateur_present` | boolean | Mode accompagnateur ou autonomie |
| `noms_accompagnateurs` | text | Si accompagnateur présent |
| `personne_urgence_nom`, `personne_urgence_tel` | text | Si autonomie |
| `attestation_responsabilite` | boolean | **Bloquant**, obligatoire à l'inscription |
| `presence` | enum | `inscrit` \| `present` \| `absent` (émargement) |
| `canceled_at` | timestamptz | |

### `contact_messages`
Messages reçus via formulaire contact.

### `newsletter_subscribers`
Double opt-in avec `confirmation_token` et `confirmed_at`.

## Relations

- `organisme → prescripteurs` (1:N)
- `organisme → jeunes` (1:N, via `organisme_id` sur `jeunes`)
- `prescripteur → inscriptions` (1:N)
- `jeune → inscriptions` (1:N)
- `action → inscriptions` (1:N)
- `etablissement → actions` (1:N)

## Voir aussi

- [[concepts/rls-isolation]] — comment `organisme_id` est utilisé pour l'isolation
- [[concepts/module-budget]] — comment `cost` est ventilé
- [[concepts/emargement]] — comment `presence` est saisie
