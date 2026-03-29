# Architecture Complete — Prado Itineraires

## 1. Vue d'ensemble

```mermaid
graph TB
    V[fa:fa-user Visiteur]
    P[fa:fa-user-tie Prescripteur]
    A[fa:fa-user-shield Admin]

    V --> VITRINE
    P --> ESPACE
    A --> ADMIN

    subgraph VITRINE["Site Vitrine"]
        direction TB
        HOME[Homepage]
        ACTIONS_PUB[Catalogue Actions]
        ACTUS[Actualites]
        RESS_PUB[Ressources]
        CONTACT[Contact]
        DOCS[Documents]
        LEGAL[Mentions legales]
        PROGRAMMES["Programmes<br/>Foodtruck / Fresque / EduColab"]
    end

    subgraph ESPACE["Espace Prescripteur"]
        direction TB
        DASH["Dashboard<br/>Stats + Actions contextuelles"]
        JEUNES["Gestion Jeunes<br/>CRUD + Export CSV"]
        JEUNE_DET["Fiche Jeune<br/>Identite + Sante + Famille"]
        ACTIONS_ESP["Catalogue Actions<br/>Filtres + Inscriptions"]
        INSCRIPTIONS[Mes Inscriptions]
        RESS_ESP[Ressources]
        PARAMS["Parametres<br/>Profil + Securite + Compte"]
    end

    subgraph ADMIN["Panel Admin"]
        direction TB
        ADMIN_DASH["Dashboard<br/>Stats + Activite"]
        ADMIN_PRESC["Prescripteurs<br/>Approuver / Rejeter"]
        ADMIN_JEUNES[Vue Jeunes]
        ADMIN_ACTIONS["Actions<br/>Creer + Archiver"]
        ADMIN_INSCR[Inscriptions]
        ADMIN_CONTACTS[Messages Contact]
        ADMIN_NEWS[Newsletter]
    end

    JEUNES --> JEUNE_DET
    ACTIONS_ESP --> JEUNE_DET
```

## 2. API Routes

```mermaid
graph TB
    subgraph PUBLIC["API Publiques"]
        direction TB
        A1["GET /api/actions"]
        A2["GET /api/actions/map"]
        A3["GET /api/actions/:id"]
        A4["POST /api/contact"]
        A5["POST /api/newsletter"]
        A6["GET /api/newsletter/confirm"]
        A7["POST /api/check-email"]
    end

    subgraph AUTH["API Authentifiees"]
        direction TB
        B1["POST /api/complete-profile"]
        B2["POST /api/update-profile"]
        B3["POST /api/delete-account"]
        B4["GET /api/export-data"]
        B5["GET /api/jeunes/:id/sante"]
        B6["PUT /api/jeunes/:id/sante"]
        B7["PUT /api/jeunes/:id"]
    end

    subgraph VERIFF["API Veriff"]
        direction TB
        C1["POST /api/veriff/session"]
        C2["POST /api/webhooks/veriff"]
    end

    subgraph ADMIN_API["API Admin"]
        direction TB
        D1["GET /api/admin/stats"]
        D2["GET /api/admin/activity"]
        D3["GET/POST/PATCH<br/>/api/admin/actions"]
        D4["GET/PATCH<br/>/api/admin/prescripteurs"]
        D5["GET /api/admin/jeunes"]
        D6["GET/PATCH<br/>/api/admin/contacts"]
        D7["GET /api/admin/newsletter"]
        D8["GET /api/admin/inscriptions"]
    end

    subgraph CRON["Cron Jobs"]
        direction TB
        E1["GET /api/cron/archive-actions"]
        E2["GET /api/cron/send-reminders"]
    end

    PUBLIC --- |"Aucune auth"| SB[(Supabase)]
    AUTH --- |"JWT utilisateur"| SB
    VERIFF --- |"HMAC-SHA256"| VF[Veriff]
    ADMIN_API --- |"Service Role Key"| SB
    CRON --- |"X-Cron-Secret"| SB
```

## 3. Base de donnees

```mermaid
erDiagram
    prescripteurs {
        uuid id PK
        text name
        text professional_email
        text structure
        text phone
        enum role "prescripteur | admin"
        enum status "pending | approved | rejected"
        timestamptz created_at
    }

    jeunes {
        uuid id PK
        uuid prescripteur_id FK
        text first_name
        text last_name
        date date_of_birth
        text address
        text postal_code
        text city
        text situation
        text notes
        boolean identity_verified
        text veriff_session_id
    }

    jeune_sante {
        uuid id PK
        uuid jeune_id FK
        jsonb allergies
        jsonb handicap
        jsonb suivi_psychologique
        jsonb suivi_medical
        jsonb traitements_en_cours
        jsonb contacts_urgence
        jsonb medecin_traitant
        jsonb mesure_protection
        jsonb referent_ase
        jsonb composition_familiale
        text lieu_hebergement
        text droits_parentaux
        text notes_confidentielles
    }

    actions {
        bigint id PK
        text title
        text category
        date date
        text description
        boolean is_published
        boolean is_activite
        integer places_max
        timestamptz archived_at
    }

    inscriptions {
        uuid id PK
        uuid prescripteur_id FK
        uuid jeune_id FK
        bigint action_id FK
        timestamptz canceled_at
    }

    contact_messages {
        uuid id PK
        text name
        text email
        text subject
        text message
        boolean is_read
    }

    newsletter_subscribers {
        uuid id PK
        text email
        text structure
        uuid confirmation_token
        timestamptz confirmed_at
    }

    prescripteurs ||--o{ jeunes : "gere"
    jeunes ||--o| jeune_sante : "a"
    prescripteurs ||--o{ inscriptions : "cree"
    jeunes ||--o{ inscriptions : "inscrit a"
    actions ||--o{ inscriptions : "recoit"
```

## 4. Droits d'acces

```mermaid
graph TB
    subgraph VISIT["Visiteur"]
        direction TB
        VA["Site vitrine"]
        VB["Catalogue public"]
        VC["Contact"]
        VD["Newsletter"]
    end

    subgraph PENDING["Prescripteur PENDING"]
        direction TB
        PA["Dashboard lecture seule"]
        PB["Parcourir actions"]
        PC["Parcourir ressources"]
        PD["Parametres profil"]
        PE["Ajouter jeunes BLOQUE"]
        PF["Inscrire jeunes BLOQUE"]
    end

    subgraph APPROVED["Prescripteur APPROVED"]
        direction TB
        QA["Dashboard complet"]
        QB["CRUD ses propres jeunes"]
        QC["Fiche sante ses jeunes"]
        QD["Inscrire a des actions"]
        QE["Verif identite Veriff"]
        QF["Export CSV"]
        QG["Annuler inscriptions"]
    end

    subgraph ADM["Admin"]
        direction TB
        RA["Stats globales"]
        RB["Approuver prescripteurs"]
        RC["Voir tous les jeunes"]
        RD["Creer/archiver actions"]
        RE["Gerer capacite"]
        RF["Messages contact"]
        RG["Newsletter"]
        RH["Exports"]
    end

    subgraph RLS["Row Level Security"]
        direction TB
        R1["prescripteurs<br/>SELECT own row"]
        R2["jeunes<br/>WHERE prescripteur_id = uid"]
        R3["jeune_sante<br/>WHERE jeune.prescripteur_id = uid"]
        R4["inscriptions<br/>WHERE prescripteur_id = uid"]
    end

    subgraph MW["Middleware"]
        direction TB
        M1["auth.ts<br/>Redirige si non connecte"]
        M2["admin.ts<br/>Redirige si pas admin"]
        M3["requireAdmin<br/>Verifie role serveur"]
    end

    VISIT -.->|"Aucun auth"| RLS
    PENDING -->|"JWT"| RLS
    APPROVED -->|"JWT"| RLS
    ADM -->|"Service Role"| RLS
```

## 5. Services externes

```mermaid
graph TB
    APP["Nuxt 3<br/>Vercel SSR"]

    APP --> SB
    APP --> PR
    APP --> VF
    APP --> RS
    APP --> GEO

    subgraph SB["Supabase (EU)"]
        direction TB
        SB1["Auth<br/>Magic Link<br/>Password<br/>Reset"]
        SB2["PostgreSQL<br/>RLS Policies<br/>7 tables"]
        SB3["Storage<br/>Images"]
    end

    subgraph PR["Prismic"]
        direction TB
        PR1["Homepage"]
        PR2["Articles"]
        PR3["Ressources"]
        PR4["Documents"]
    end

    subgraph VF["Veriff (EU)"]
        direction TB
        VF1["InContext SDK<br/>iframe"]
        VF2["Webhook<br/>HMAC-SHA256"]
        VF3["Decisions<br/>9001=OK 9102=KO"]
    end

    subgraph RS["Resend"]
        direction TB
        RS1["Newsletter"]
        RS2["Contact"]
        RS3["Confirmation"]
        RS4["Rappels"]
    end

    subgraph GEO["Geoplateforme"]
        direction TB
        GEO1["Autocompletion<br/>adresses FR"]
        GEO2["BAN<br/>gratuit sans cle"]
    end
```

## 6. Flux d'authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant APP as Nuxt App
    participant API as Server API
    participant SB as Supabase Auth
    participant ADM as Admin Prado

    U->>APP: Entre son email
    APP->>API: POST /api/check-email
    API->>SB: Verifie existence
    SB-->>API: exists true/false

    alt Nouveau utilisateur
        API-->>APP: exists false
        APP->>U: Formulaire inscription
        Note over U: Prenom, Nom,<br/>Structure, Fonction,<br/>Mot de passe
        U->>APP: Soumet
        APP->>SB: signUp
        SB-->>APP: User cree
        APP->>API: POST /api/complete-profile
        API->>SB: Upsert prescripteur<br/>status pending
        APP->>U: Dashboard restreint
        Note over ADM: Notifie
        ADM->>API: PATCH prescripteurs<br/>status approved
        Note over U: Acces complet
    else Utilisateur existant
        API-->>APP: exists true
        APP->>U: Mot de passe
        U->>APP: Saisit mdp
        APP->>SB: signInWithPassword
        SB-->>APP: Session
        APP->>U: Redirect /espace
    end
```

## 7. Flux inscription jeune

```mermaid
sequenceDiagram
    participant P as Prescripteur
    participant APP as Nuxt App
    participant SB as Supabase

    P->>APP: Ouvre fiche jeune
    P->>APP: Inscrire a une action
    APP->>APP: Affiche picker
    P->>APP: Selectionne action
    APP->>SB: SELECT places_max
    APP->>SB: COUNT inscriptions actives

    alt Places disponibles
        APP->>SB: INSERT inscription
        SB-->>APP: OK
        APP->>P: Inscription reussie
    else Complet
        APP->>P: Action complete
    end
```

## 8. Flux verification identite

```mermaid
sequenceDiagram
    participant P as Prescripteur
    participant J as Jeune
    participant APP as Nuxt App
    participant API as Server API
    participant VF as Veriff

    P->>APP: Fiche jeune
    P->>APP: Verifier identite
    APP->>API: POST /api/veriff/session
    API->>API: Verifie ownership
    API->>VF: POST /v1/sessions
    VF-->>API: sessionUrl
    API->>SB: SET veriff_session_id
    API-->>APP: sessionUrl
    APP->>APP: Ouvre iframe Veriff
    J->>APP: Piece identite + selfie
    APP->>VF: Soumet
    VF-->>APP: SUBMITTED
    APP->>P: Verification soumise

    Note over VF: Traitement async

    VF->>API: Webhook HMAC
    API->>API: Verifie signature

    alt 9001 approved
        API->>SB: identity_verified = true
    else 9102 declined
        Note over API: Reste false
    end
```
