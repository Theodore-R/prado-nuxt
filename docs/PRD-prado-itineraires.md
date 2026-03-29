# PRD — Prado Itineraires

> **Schema d'architecture** : [Ouvrir dans Excalidraw](https://excalidraw.com/#json=https://gist.githubusercontent.com/Theodore-R/9c628b0f0834fec3ebea57e24d141a03/raw/architecture-prado.excalidraw)

## 1. Vision du projet

**Prado Itineraires** est une plateforme numerique socio-educative qui connecte les professionnels de l'accompagnement (prescripteurs) avec les jeunes beneficiaires de l'association Le Prado, dans le departement du Rhone.

### Objectifs
- Permettre aux prescripteurs de gerer leurs jeunes et de les inscrire a des actions socio-educatives
- Offrir un catalogue d'actions (ateliers, formations, stages) filtrable et consultable
- Fournir un panneau d'administration pour l'equipe Prado
- Presenter l'association et ses programmes au grand public (site vitrine)

### Utilisateurs cibles
| Role | Description | Acces |
|------|-------------|-------|
| **Visiteur** | Grand public | Site vitrine, catalogue, contact |
| **Prescripteur** | Educateur, referent ASE/PJJ, conseiller en insertion | Dashboard, gestion jeunes, inscriptions |
| **Admin** | Equipe Prado | Validation prescripteurs, gestion actions, stats |

---

## 2. Stack technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Nuxt 3** | 3.21+ | Framework SSR/SSG |
| **Vue 3** | 3.5+ | Composants reactifs |
| **Tailwind CSS 4** | 4.1+ | Styling utilitaire |
| **Lucide Vue** | 0.487+ | Icones |
| **GSAP** | 3.14+ | Animations scroll |
| **Vue Sonner** | 1.3+ | Notifications toast |

### Backend & Services
| Service | Usage | Hebergement |
|---------|-------|-------------|
| **Supabase** | Auth + BDD PostgreSQL + RLS | Cloud (EU) |
| **Prismic** | CMS headless (articles, ressources, homepage) | Cloud |
| **Veriff** | Verification d'identite des jeunes | Cloud (EU) |
| **Resend** | Emails transactionnels | Cloud |
| **API Geoplateforme** | Autocompletion adresses francaises | Gouvernement FR |

### Deploiement
| Element | Detail |
|---------|--------|
| **Hebergement** | Vercel (serverless, edge) |
| **Build** | Nuxt SSR avec preset Vercel |
| **CI/CD** | Push to main → deploy automatique |
| **Domaine** | A configurer (prado-itineraires.fr) |

---

## 3. Architecture

### Vue d'ensemble

```
┌──────────────────────────────────────────────────────────┐
│                    NAVIGATEUR CLIENT                      │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │Site       │  │Espace      │  │Panel Admin           │  │
│  │Vitrine   │  │Prescripteur│  │                      │  │
│  └──────────┘  └────────────┘  └──────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS
┌──────────────────────┴───────────────────────────────────┐
│                    NUXT 3 (Vercel)                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Server API Routes (/api/*)                           │ │
│  │ - Auth endpoints     - Admin endpoints               │ │
│  │ - Veriff webhooks    - Cron jobs                     │ │
│  │ - CRUD jeunes        - Newsletter/Contact            │ │
│  └──────────────────────────────────────────────────────┘ │
└─────┬──────────┬──────────┬──────────┬───────────────────┘
      │          │          │          │
┌─────┴────┐┌───┴────┐┌───┴────┐┌───┴──────┐
│Supabase  ││Prismic ││Veriff  ││Resend    │
│- Auth    ││- CMS   ││- KYC   ││- Email   │
│- Postgres││- Assets ││- IDV   ││          │
│- RLS     ││        ││        ││          │
└──────────┘└────────┘└────────┘└──────────┘
```

### Base de donnees

#### Tables principales

**prescripteurs**
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | = auth.users.id |
| name | text | Prenom + Nom |
| professional_email | text | Email pro |
| structure | text | Etablissement |
| phone | text | Telephone |
| role | enum | prescripteur / admin |
| status | enum | pending / approved / rejected |

**jeunes**
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| prescripteur_id | uuid (FK) | Lie au prescripteur |
| first_name | text | Prenom |
| last_name | text | Nom |
| date_of_birth | date | Date de naissance |
| address | text | Adresse |
| postal_code | text | Code postal |
| city | text | Ville |
| situation | text | Situation globale |
| notes | text | Notes internes |
| identity_verified | boolean | Verifie via Veriff |
| veriff_session_id | text | ID session Veriff |

**jeune_sante** (donnees de sante)
| Colonne | Type | Description |
|---------|------|-------------|
| jeune_id | uuid (FK, UNIQUE) | Lie au jeune |
| allergies | jsonb | Liste d'allergies |
| handicap | jsonb | Informations handicap |
| suivi_psychologique | jsonb | Suivi psy |
| suivi_medical | jsonb | Suivis medicaux |
| traitements_en_cours | jsonb | Traitements |
| contacts_urgence | jsonb | Contacts d'urgence |
| medecin_traitant | jsonb | Medecin traitant |
| mesure_protection | jsonb | Mesures de protection |
| referent_ase | jsonb | Referent ASE |
| composition_familiale | jsonb | Composition familiale |

**actions**
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint (PK) | Identifiant |
| title | text | Titre de l'action |
| category | text | Categorie |
| date | date | Date de l'action |
| places_max | integer | Capacite (null = illimite) |
| archived_at | timestamptz | Date d'archivage |
| is_published | boolean | Publie ou non |

**inscriptions**
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant |
| prescripteur_id | uuid (FK) | Prescripteur |
| jeune_id | uuid (FK) | Jeune inscrit |
| action_id | bigint (FK) | Action ciblee |
| canceled_at | timestamptz | Annulation |

---

## 4. Fonctionnalites

### 4.1 Site vitrine (public)
- Page d'accueil avec hero animee, programmes, impact, FAQ, partenaires
- Catalogue d'actions publiques (filtrable par categorie)
- Section actualites (articles Prismic)
- Section ressources (documents Prismic)
- Page de contact avec formulaire
- Newsletter avec double opt-in
- Pages institutionnelles (mentions legales, politique de confidentialite)
- Theme clair/sombre

### 4.2 Espace prescripteur (authentifie)
- **Inscription** : email + mot de passe, magic link, ou mot de passe classique
- **Onboarding** : profil professionnel (prenom, nom, structure, fonction, telephone)
- **Widget de demarrage rapide** : checklist flottante avec progression
- **Dashboard** : stats (jeunes, inscriptions), actions contextuelles, dernieres inscriptions
- **Gestion des jeunes** :
  - CRUD fiches jeunes (identite, adresse avec autocompletion, situation)
  - Fiche sante (allergies, handicap, suivi medical, contacts urgence)
  - Fiche famille (mesure protection, referent ASE, composition familiale)
  - Verification d'identite via Veriff (en presence du jeune)
  - Export CSV
- **Inscriptions** : inscrire un jeune a une action, gestion capacite, annulation
- **Catalogue** : parcourir les actions/activites depuis le dashboard
- **Ressources** : consulter les ressources (documents, guides)
- **Parametres** : modifier profil, changer mot de passe, supprimer compte

### 4.3 Panel admin
- **Dashboard** : compteurs (prescripteurs, jeunes, inscriptions, contacts, newsletter)
- **Validation prescripteurs** : approuver/rejeter les demandes, filtrage par statut
- **Gestion actions** : creer, archiver, gerer la capacite
- **Vue globale jeunes** : tous les jeunes de tous les prescripteurs
- **Inscriptions** : vue d'ensemble de toutes les inscriptions
- **Contacts** : messages recus, marquer comme lu, export
- **Newsletter** : abonnes, export CSV

### 4.4 Emails transactionnels
- Confirmation d'inscription newsletter
- Notification de contact recu (admin)
- Rappels avant actions (J-2, J-1)
- Magic link de connexion

---

## 5. Securite & RGPD

### Authentification
- Magic link (OTP) via Supabase Auth
- Mot de passe (6 caracteres minimum)
- Reinitialisation de mot de passe par email
- Validation manuelle des comptes par l'admin (workflow pending → approved)

### Autorisation
- **Row Level Security (RLS)** : chaque prescripteur ne voit que ses propres donnees
- **Middleware** : protection des routes (`auth.ts`, `admin.ts`)
- **Service role** : cle utilisee uniquement cote serveur

### Verification d'identite
- **Veriff** : verification d'identite des jeunes avec piece d'identite
- HMAC-SHA256 sur les webhooks pour prevenir le spoofing

### Protection des donnees
- Donnees hebergees en Europe (Supabase EU)
- Pas de donnees sensibles dans les URLs
- Tokens de confirmation a usage unique (newsletter)
- Sanitization des entrees (contact form, HTML escape)

### 5.1 Hebergement HDS pour les donnees de sante

**Obligation legale** : Les donnees de sante a caractere personnel (Art. L1111-8 du Code de la Sante Publique) doivent etre hebergees chez un hebergeur certifie HDS (Hebergeur de Donnees de Sante).

**Situation actuelle** : La table `jeune_sante` (allergies, handicap, suivi medical, traitements, contacts urgence, medecin traitant, mesures de protection) est temporairement stockee dans Supabase. Supabase n'est pas certifie HDS.

**Plan de migration** :

| Etape | Detail |
|-------|--------|
| **1. Base de donnees HDS** | Deployer une instance PostgreSQL chez un hebergeur certifie HDS (ex: OVH Healthcare, Scaleway HDS, Clever Cloud HDS, Azure Health Data Services) |
| **2. Chiffrement** | Les donnees de sante seront chiffrees au repos (AES-256) avec une cle de chiffrement geree cote serveur (`hdsEncryptionKey`). Le chiffrement est applique avant l'ecriture et le dechiffrement apres la lecture |
| **3. API dediee** | Les endpoints `/api/jeunes/:id/sante` communiquent deja avec une couche d'abstraction (`server/utils/hds-client.ts`) preparee pour pointer vers la base HDS |
| **4. Separation des donnees** | Les donnees d'identite (nom, prenom, date de naissance) restent dans Supabase. Seules les donnees de sante stricto sensu transitent vers la base HDS. La liaison se fait par `jeune_id` (UUID) |
| **5. Acces controle** | Memes regles RLS : un prescripteur n'accede qu'aux donnees de sante de ses propres jeunes. L'authentification est verifiee cote serveur avant chaque acces a la base HDS |
| **6. Journalisation** | Chaque acces en lecture/ecriture aux donnees de sante est journalise (qui, quand, quelle donnee) pour la tracabilite exigee par la reglementation |

**Architecture cible** :

```
Supabase (EU)                     Hebergeur HDS (certifie)
┌─────────────────────┐           ┌─────────────────────┐
│ prescripteurs       │           │ jeune_sante         │
│ jeunes              │──jeune_id──│ (chiffre AES-256)   │
│ actions             │           │ allergies           │
│ inscriptions        │           │ handicap            │
│ contact_messages    │           │ suivi_medical       │
│ newsletter          │           │ traitements         │
└─────────────────────┘           │ contacts_urgence    │
                                  │ medecin_traitant    │
                                  │ mesure_protection   │
                                  │ composition_famille │
                                  └─────────────────────┘
```

**Hebergeurs HDS envisages** :

| Hebergeur | Certification | Prix indicatif |
|-----------|--------------|----------------|
| OVH Healthcare | HDS | ~50 EUR/mois (BDD managee) |
| Scaleway | HDS | ~30 EUR/mois |
| Clever Cloud | HDS | ~40 EUR/mois |

**Calendrier** : Migration prevue en phase 2 du projet, avant la mise en production avec des donnees reelles de sante.

### RGPD
- Bandeau cookies avec choix accepter/refuser
- Politique de confidentialite
- Droit a la suppression (suppression de compte)
- Export des donnees personnelles
- Consentement newsletter avec double opt-in

---

## 6. Design system

### Palette de couleurs
| Token | Valeur | Usage |
|-------|--------|-------|
| Primary | `#CF006C` | Boutons principaux, accents |
| Secondary | `#93C1AF` | Succes, validations |
| Accent | `#FB6223` | Alertes, badges |
| Dark | `#004657` | Actions secondaires, sidebar |
| Background (dark) | `#1a1a2e` | Fond principal |
| Background (light) | `#f5f5f7` | Fond mode clair |

### Typographie
- **Police** : Poppins (Google Fonts)
- **Graisses** : 400, 500, 600
- **Style** : titres en italique

### Composants
- Boutons arrondis (rounded-full)
- Cards avec bordures subtiles et coins arrondis (rounded-2xl)
- Tables de donnees avec tri, recherche, pagination
- Toasts de notification (vue-sonner)
- Modales de confirmation
- Theme clair/sombre avec toggle

---

## 7. Roadmap

### Livre (v1)
- [x] Site vitrine complet avec CMS
- [x] Authentification (magic link + mot de passe)
- [x] Espace prescripteur (dashboard, jeunes, inscriptions)
- [x] Panel admin (validation, gestion)
- [x] Onboarding avec checklist interactive
- [x] Verification d'identite (Veriff)
- [x] Autocompletion d'adresses (API Geoplateforme)
- [x] Fiche sante et situation familiale
- [x] Theme clair/sombre
- [x] Newsletter avec double opt-in
- [x] Export CSV (jeunes, contacts, newsletter)

### En cours / Prevu
- [ ] Migration donnees de sante vers hebergeur HDS certifie (voir section 5.1)
- [ ] Integration FranceConnect (a terme)
- [ ] Emails de rappel automatiques (J-2, J-1)
- [ ] Notifications in-app
- [ ] Statistiques avancees (admin)
- [ ] Application mobile (PWA)
- [ ] Cartographie des actions (carte interactive)

---

## 8. Acces

### URLs
| Environnement | URL |
|---------------|-----|
| Production | A configurer |
| Staging | Vercel preview (auto par PR) |
| Local | http://localhost:3000 |

### Comptes de test
| Email | Mot de passe | Role |
|-------|-------------|------|
| theo@allside.studio | Allside2026! | Prescripteur (approuve) |
| test-veriff@prado.fr | TestVeriff2026! | Prescripteur (approuve) |

### Services externes
| Service | Acces |
|---------|-------|
| Supabase | Dashboard projet vafbtwbsxdlefksonpyg |
| Prismic | Dashboard via slicemachine |
| Veriff | station.veriff.com (compte Prado Itineraires) |
| Vercel | Dashboard projet |
