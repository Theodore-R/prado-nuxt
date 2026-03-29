# Plan : Verification d'Identite pour Prado Itineraires

## Contexte

Prado Itineraires est une plateforme socio-educative connectant des **prescripteurs** (referents professionnels) avec des **jeunes** (beneficiaires, souvent mineurs ou jeunes adultes en situation de vulnerabilite — protection de l'enfance, insertion, etc.).

### Systeme actuel
- **Authentification** : Email + magic link (Supabase Auth)
- **Validation** : Manuelle par admin (statut pending → approved/rejected)
- **Donnees collectees** : Prenom, nom, fonction, structure, telephone
- **Aucune verification d'identite formelle** n'existe actuellement

---

## 1. Pour qui la verification d'identite est-elle necessaire ?

### Prescripteurs — OUI (recommande)

**Pourquoi :**
- Ils accedent aux **donnees personnelles de mineurs** (nom, date de naissance, adresse, situation)
- Ils **inscrivent des jeunes a des actions** au nom de leur structure
- La validation manuelle actuelle repose sur la bonne foi (nom + structure) sans preuve
- Un imposteur pourrait s'inscrire comme prescripteur et acceder aux donnees des jeunes
- Renforce la **confiance institutionnelle** aupres des structures partenaires et des familles

**Niveau recommande :** Verification d'identite de base (FranceConnect niveau "faible" ou verification de document)

### Jeunes — NON

**Pourquoi :**
- Ne sont pas des utilisateurs directs de la plateforme
- Sont crees et geres par les prescripteurs
- Pas d'accès autonome au systeme
- Ajouter une verification d'identite pour les jeunes (souvent mineurs) serait disproportionne et juridiquement complexe (consentement parental, CNIL)

### Admins — NON

**Pourquoi :**
- Personnel interne de l'association Prado
- Verification d'identite geree par les processus internes RH
- Nombre tres restreint de comptes

---

## 2. Cadre reglementaire

### Obligation legale ?
**Non obligatoire** pour une association socio-educative. La verification d'identite est legalement requise dans des secteurs specifiques (banque, jeux, telecom) mais PAS pour les associations.

### Cependant, contexte favorable :
- **Travail avec des mineurs** : L'honorabilite des encadrants est verifiee via le systeme SIAM (casier judiciaire), mais c'est un processus separe
- **RGPD / Donnees de mineurs** : L'article 45 de la Loi Informatique et Libertes impose des protections renforcees pour les donnees des moins de 15 ans
- **Recommandation CNIL** : Utiliser un tiers de confiance pour la verification d'age/identite plutot que la collecte directe de pieces d'identite
- **Confiance** : Les structures partenaires seront rassurées de savoir que les prescripteurs sont verifies

### FranceConnect — Eligibilite de Prado
Prado pourrait etre eligible au titre des **"activites sportives ou socioculturelles"** (secteur experimental). Criteres :
- Service lie a des activites socioculturelles → **OUI**
- FranceConnect reste optionnel (pas seul moyen d'auth) → a respecter
- Processus de qualification necessaire aupres de la DINUM

---

## 3. Solutions envisageables

### Option A : FranceConnect (Recommandee)

| Critere | Detail |
|---------|--------|
| **Cout** | Gratuit (secteur public/associatif) |
| **Niveau eIDAS** | Faible (standard) / Substantiel-Eleve (FC+) |
| **Integration** | OpenID Connect standard |
| **Donnees obtenues** | Prenom, nom, date de naissance, genre, lieu de naissance |
| **Complexite** | Moyenne (qualification DINUM + OIDC) |
| **Confiance** | Maximale (service de l'Etat) |

**Avantages :**
- Gratuit
- Confiance institutionnelle tres forte
- Donnees d'identite fiables (issues des impots, Ameli, etc.)
- UX familiere pour les utilisateurs francais
- Pas de stockage de pieces d'identite (conforme RGPD)

**Inconvenients :**
- Processus de qualification (sandbox → integration → qualification → production)
- Delai d'obtention : 2-4 mois
- Doit rester optionnel
- Ne verifie pas l'appartenance a une structure professionnelle

### Option B : Verification de document d'identite (Ariadnext/IDnow)

| Critere | Detail |
|---------|--------|
| **Cout** | ~1 EUR/verification (automatisee) |
| **Niveau eIDAS** | Substantiel (PVID certifie ANSSI) |
| **Integration** | REST API + SDK Web/Mobile |
| **Complexite** | Faible-Moyenne (API + webhook) |
| **Confiance** | Elevee (PVID certifie) |

**Avantages :**
- Integration rapide via API
- PVID certifie ANSSI
- SDK mobile natif (iOS, Android, React Native)
- Verification automatisee en temps reel

**Inconvenients :**
- Cout par verification (mais faible volume attendu pour Prado)
- Stockage temporaire de donnees biometriques (conformite RGPD a gerer)
- Pas gratuit

### Option C : Verification manuelle amelioree (Pragmatique)

| Critere | Detail |
|---------|--------|
| **Cout** | Gratuit (dev interne uniquement) |
| **Niveau** | Aucune certification |
| **Integration** | Ajout de champs + upload dans le formulaire existant |
| **Complexite** | Faible |

**Implementation :**
1. Demander un **justificatif professionnel** a l'inscription (carte professionnelle, attestation structure)
2. Upload de document dans le formulaire d'onboarding (step 2)
3. Admin verifie le document avant approbation
4. Optionnel : verification email professionnel (domaine @structure.fr)

**Avantages :**
- Zero cout externe
- Implementation rapide
- Adapte au volume actuel (faible nombre de prescripteurs)
- Pas de dependance a un service tiers

**Inconvenients :**
- Pas de verification d'identite au sens strict (juste un justificatif pro)
- Charge de travail admin supplementaire
- Pas de certification officielle

### Option D : FranceConnect + Justificatif pro (Ideale a terme)

Combiner FranceConnect (identite) + justificatif professionnel (rattachement structure) :
1. FranceConnect verifie que la personne est bien qui elle dit etre
2. Le justificatif pro confirme son rattachement a une structure partenaire
3. L'admin valide le tout

---

## 4. Recommandation

### Court terme (MVP) — Option C
**Verification manuelle amelioree** : ajout d'un champ upload de justificatif professionnel dans l'onboarding.

- Implementation en 1-2 jours
- Zero cout
- Ameliore significativement le processus actuel
- Permet a l'admin de verifier un document concret

### Moyen terme (3-6 mois) — Option A
**FranceConnect** : lancer le processus de qualification DINUM en parallele.

- Gratuit
- Confiance maximale
- UX familiere
- Delai de qualification : 2-4 mois

### Long terme (optionnel) — Option D
**FranceConnect + Justificatif pro** pour un processus complet.

---

## 5. Implementation — Option C (Court terme)

### Task Type
- [x] Frontend (formulaire upload)
- [x] Backend (stockage + API)
- [ ] Fullstack

### Steps

#### Step 1 : Migration Supabase — Stockage documents
- Creer un bucket Supabase Storage `identity-documents`
- Ajouter colonne `identity_document_url` a la table `prescripteurs`
- Politique RLS : prescripteur peut uploader pour lui-meme, admin peut lire tous

#### Step 2 : Formulaire upload (OnboardingStep2.vue)
- Ajouter un champ upload de fichier (image/PDF)
- Libelle : "Justificatif professionnel (carte pro, attestation employeur, etc.)"
- Validation : formats acceptes (jpg, png, pdf), taille max 5 Mo
- Preview du fichier uploade

#### Step 3 : API serveur
- Modifier `/api/complete-profile.post.ts` pour accepter le fichier
- Upload vers Supabase Storage
- Sauvegarder l'URL dans la table prescripteurs

#### Step 4 : Interface admin
- Afficher le document dans la page de validation des prescripteurs
- Bouton pour telecharger/visualiser le document
- Faciliter la decision approve/reject

### Key Files
| Fichier | Operation | Description |
|---------|-----------|-------------|
| supabase/migrations/xxx.sql | Creer | Bucket storage + colonne |
| components/onboarding/OnboardingStep2.vue | Modifier | Ajout champ upload |
| server/api/complete-profile.post.ts | Modifier | Gestion upload fichier |
| pages/admin/prescripteurs.vue | Modifier | Affichage document |

---

## 6. Implementation — Option A (Moyen terme : FranceConnect)

### Pre-requis
1. Demander l'acces sandbox sur partenaires.franceconnect.gouv.fr
2. Creer un "fournisseur de service" dans le backoffice DINUM
3. Definir les scopes necessaires : `openid profile birth`
4. Fournir les URLs de callback

### Steps techniques

#### Step 1 : Configuration OIDC
- Installer une librairie OIDC compatible Nuxt (ex: `nuxt-oidc-auth`)
- Configurer les endpoints FranceConnect :
  - Authorization : `/api/v2/authorize`
  - Token : `/api/v2/token`
  - UserInfo : `/api/v2/userinfo`
  - Logout : `/api/v2/logout`
- Variables d'environnement : `FC_CLIENT_ID`, `FC_CLIENT_SECRET`, `FC_ISSUER`

#### Step 2 : Flow d'authentification
- Bouton "Se connecter avec FranceConnect" sur la page de connexion
- Callback handler : recevoir le code → echanger contre un token → recuperer les infos
- Mapper les donnees FC vers le profil prescripteur (given_name → prenom, family_name → nom, birthdate)

#### Step 3 : Liaison compte
- Si email FC correspond a un compte existant → lier
- Si nouveau compte → creer avec les donnees FC pre-remplies
- Marquer le compte comme "FC verifie" (nouveau champ `identity_verified: boolean`)

#### Step 4 : UX d'onboarding adapte
- Si inscription via FC : sauter la saisie nom/prenom (deja verifie)
- Afficher un badge "Identite verifiee" dans le profil et l'admin
- FC reste optionnel : l'inscription classique (email + magic link) reste disponible

### Key Files
| Fichier | Operation | Description |
|---------|-----------|-------------|
| nuxt.config.ts | Modifier | Config module OIDC |
| server/api/auth/fc-callback.get.ts | Creer | Callback FranceConnect |
| server/api/auth/fc-login.get.ts | Creer | Initier flow FC |
| pages/connexion.vue | Modifier | Bouton FranceConnect |
| components/onboarding/OnboardingStep2.vue | Modifier | Adaptation si FC |
| supabase/migrations/xxx.sql | Creer | Champ identity_verified |

---

## 7. Risques et mitigation

| Risque | Mitigation |
|--------|------------|
| Refus eligibilite FranceConnect | Option C reste valable independamment |
| Delai qualification DINUM | Lancer le processus en parallele du dev |
| Faible adoption FC par les prescripteurs | Garder l'inscription classique + justificatif pro |
| Stockage documents sensibles (RGPD) | Bucket prive + RLS strict + retention limitee |
| Complexite integration OIDC | Utiliser une lib testee (nuxt-oidc-auth) |
| Cout Ariadnext/IDnow si Option B | Volume faible → cout negligeable, mais Option A (gratuit) preferable |

---

## 8. Tableau comparatif final

| Critere | Option C (Justif. pro) | Option A (FranceConnect) | Option B (PVID) |
|---------|----------------------|--------------------------|-----------------|
| **Cout** | 0 EUR | 0 EUR | ~1 EUR/verif |
| **Delai implementation** | 1-2 jours | 2-4 mois (qualif.) | 1-2 semaines |
| **Niveau de verification** | Document pro | Identite civile | Identite + biometrie |
| **Certification** | Aucune | eIDAS faible/substantiel | PVID ANSSI |
| **Confiance utilisateur** | Moyenne | Elevee | Tres elevee |
| **Charge admin** | Augmentee | Reduite | Reduite |
| **Dependance externe** | Non | DINUM | Fournisseur prive |
| **RGPD** | Simple (doc pro) | Optimal (pas de stockage) | Complexe (biometrie) |

---

## 9. Statut d'implementation

### Phase 1 : Veriff (IMPLEMENTEE)
- [x] Migration Supabase (`identity_verified`, `veriff_session_id`)
- [x] API session creation (`/api/veriff/session`)
- [x] Webhook handler (`/api/webhooks/veriff`) avec HMAC
- [x] Composable Vue (`useVeriff`)
- [x] UI onboarding (bouton dans Step 3)
- [x] Admin (colonne identite avec badge)
- [x] Types mis a jour (Prescripteur, AdminPrescripteur, User)
- [x] Package installe (`@veriff/incontext-sdk`)

### Phase 2 : FranceConnect (A PLANIFIER)
- [ ] Demande qualification DINUM
- [ ] Integration OIDC
- [ ] Bouton FC sur page connexion

### Configuration requise (.env)
```
NUXT_VERIFF_API_KEY=<api-key>
NUXT_VERIFF_SECRET_KEY=<secret-key>
NUXT_PUBLIC_SITE_URL=https://prado-itineraires.fr
```

### Webhook Veriff a configurer
URL: `https://<domain>/api/webhooks/veriff`

## SESSION_ID
- CODEX_SESSION: N/A (analyse interne)
- GEMINI_SESSION: N/A (analyse interne)
