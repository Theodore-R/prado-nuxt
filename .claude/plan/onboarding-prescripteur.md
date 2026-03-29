# Plan: Onboarding Prescripteur Prado Itinéraires

## Task Type
- [x] Frontend (UI multi-step, checklist, animations)
- [x] Backend (Supabase magic link, email triggers)
- [x] Fullstack

## Architecture

```
ÉTAPE 1 — Email seul (5s)
  → Magic link OU mot de passe
ÉTAPE 2 — Profil pro (30s)
  → Nom, fonction (dropdown), structure (autocomplete), téléphone
ÉTAPE 3 — Bienvenue guidée (2min)
  → 3 cards: Actions / Ressources / Ajouter un jeune
         ↓
CHECKLIST D'ACTIVATION (dashboard)
  → 5 items, barre de progression, célébrations
         ↓
SÉQUENCE EMAIL (5 emails / 14 jours)
  → Triggers comportementaux
```

## Étape 1 — Entrée minimale

- Un seul champ: email professionnel
- Magic link comme auth principale (Supabase natif)
- Option secondaire "Créer avec mot de passe"
- Réassurance: "100% gratuit · Sans engagement · Réservé aux professionnels"
- Logos partenaires en bas (Fondation du Prado, Métropole, Département)
- Badge RGPD à côté du champ
- Auto-détection domaine email → pré-remplir structure

## Étape 2 — Profil professionnel

Affiché après clic magic link OU création mot de passe.

Champs:
- Nom complet (requis)
- Fonction (dropdown: Éducateur·rice, Référent·e ASE, Référent·e PJJ, Conseiller·e insertion, Chef·fe de service, Autre)
- Structure (autocomplete 50+ partenaires connus, ou saisie libre)
- Téléphone (optionnel)

Barre de progression à 33%.
Témoignage rotatif à côté du formulaire.

## Étape 3 — Première valeur immédiate

Pas d'attente validation admin pour naviguer.
Écran de bienvenue avec 3 cards:
1. Parcourir les 89 actions → /actions
2. Consulter les 183 ressources → /ressources
3. Ajouter votre premier jeune → formulaire inline

Status `pending` restreint uniquement l'inscription à une action.

## Checklist d'activation (dashboard)

| # | Tâche | Quick win |
|---|-------|-----------|
| 1 | Créer votre compte | Auto |
| 2 | Compléter votre profil | ~30s |
| 3 | Parcourir le catalogue | Visite /actions |
| 4 | Ajouter un premier jeune | 1 jeune créé |
| 5 | Inscrire un jeune | 1 inscription |

Barre progression visuelle (début 20%).
Célébration discrète à chaque étape.
Disparaît après complétion.

## Séquence email (5 emails / 14 jours)

| # | Trigger | Sujet |
|---|---------|-------|
| 1 | Inscription | Bienvenue — votre compte est actif |
| 2 | 24h sans jeune | Ajouter votre premier jeune en 2 min |
| 3 | J+3 ou 1er jeune | 183 ressources pour votre pratique |
| 4 | J+7 sans inscription | Des actions disponibles près de chez vous |
| 5 | 1ère inscription | Invitez un·e collègue |

## Fichiers à modifier/créer

| Fichier | Op | Description |
|---------|----|-------------|
| pages/connexion.vue | Réécrire | Multi-step 3 étapes |
| composables/useAuth.ts | Modifier | Magic link + register multi-step |
| composables/useOnboarding.ts | Créer | Checklist state, progression |
| components/onboarding/OnboardingStep1.vue | Créer | Email + trust signals |
| components/onboarding/OnboardingStep2.vue | Créer | Profil pro + autocomplete |
| components/onboarding/OnboardingStep3.vue | Créer | Bienvenue + 3 cards |
| components/onboarding/OnboardingChecklist.vue | Créer | Checklist dashboard |
| components/onboarding/OnboardingProgress.vue | Créer | Barre progression |
| pages/mon-compte.vue | Modifier | Intégrer checklist |
| constants/structures.ts | Créer | Liste structures partenaires |

## Risques

| Risque | Mitigation |
|--------|-----------|
| Magic link spam | Fallback mot de passe + "Vérifiez vos spams" |
| Accès avant validation | Restreindre inscription uniquement |
| Perte données inter-étapes | localStorage sauvegarde partielle |
| Structure inconnue | Saisie libre + "Ajouter ma structure" |

## Métriques cibles

- Signup completion: 75%+
- Time-to-first-inscription: < 10 min
- Checklist completion: 40%+
- 7-day retention: 60%+
