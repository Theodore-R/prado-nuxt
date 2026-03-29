# Plan : Onboarding Widget Flottant + Contextuel

## Solution retenue : B (Widget Flottant + Nudges Contextuels)

### Principe
- La checklist "Démarrage rapide" quitte le dashboard
- Un **bouton flottant** en bas à droite avec mini cercle de progression (ex: "3/5")
- Au clic → **panneau latéral** avec les étapes détaillées (accordéon + CTA)
- **Nudges contextuels** : quand l'utilisateur visite une page liée à une étape → auto-check + toast
- **Mini-bandeau** discret sur le dashboard : "Prochaine étape : Ajouter un jeune →"
- **Confetti** au 100% de complétion

### Composants à créer/modifier

#### 1. `components/onboarding/OnboardingWidget.vue` (NOUVEAU)
- Bouton flottant rond en bas à droite (position: fixed)
- Cercle de progression SVG (stroke-dashoffset) avec compteur "3/5"
- Pulse animation quand il y a une action recommandée
- Au clic → ouvre le panneau

#### 2. `components/onboarding/OnboardingPanel.vue` (NOUVEAU)
- Panneau latéral (slide-in depuis la droite, overlay)
- Header avec titre + cercle de progression large + bouton fermer
- Liste des étapes en accordéon :
  - Icône + titre + badge "~1 min"
  - Au clic → expand avec description + bouton CTA (NuxtLink)
  - Étape complétée → checkmark vert animé, texte barré
  - Prochaine étape non complétée → mise en avant (bordure colorée)
- Bouton "Masquer définitivement" en bas

#### 3. `components/onboarding/OnboardingNextStep.vue` (NOUVEAU)
- Mini-bandeau inline pour le dashboard
- Une seule ligne : icône + "Prochaine étape : [label]" + bouton CTA
- Disparaît quand tout est complété
- Style discret mais visible

#### 4. `components/onboarding/OnboardingChecklist.vue` (SUPPRIMER)
- Remplacé par OnboardingWidget + OnboardingPanel

#### 5. `composables/useOnboarding.ts` (MODIFIER)
- Ajouter `nextStep` computed (première étape non complétée)
- Ajouter les métadonnées par étape (description, CTA link, durée estimée, icône)
- Ajouter `panelOpen` state
- Ajouter méthode `openPanel()` / `closePanel()`

#### 6. `pages/espace/index.vue` (MODIFIER)
- Retirer `<OnboardingChecklist />`
- Ajouter `<OnboardingNextStep />` (bandeau discret)

#### 7. `layouts/espace.vue` (MODIFIER)
- Ajouter `<OnboardingWidget />` au layout (visible partout dans le dashboard)

#### 8. Nudges contextuels (MODIFIER pages existantes)
- `pages/espace/actions/index.vue` ou équivalent : `complete('catalogVisited')` au mount
- `pages/espace/jeunes/index.vue` : déjà fait quand un jeune est ajouté
- Toast de félicitations quand une étape est auto-complétée

### Données des étapes

```typescript
const stepsConfig = [
  {
    key: 'accountCreated',
    label: 'Créer votre compte',
    description: 'Votre compte a été créé avec succès.',
    icon: UserCheck,
    link: null, // auto-completed
    duration: null,
  },
  {
    key: 'profileCompleted',
    label: 'Compléter votre profil',
    description: 'Renseignez votre fonction et votre structure.',
    icon: User,
    link: '/espace/parametres',
    duration: '~1 min',
  },
  {
    key: 'catalogVisited',
    label: 'Parcourir le catalogue',
    description: 'Découvrez les actions disponibles pour vos jeunes.',
    icon: BookOpen,
    link: '/espace/actions',
    duration: '~2 min',
  },
  {
    key: 'firstJeuneAdded',
    label: 'Ajouter un jeune',
    description: 'Créez une fiche pour votre premier jeune.',
    icon: UserPlus,
    link: '/espace/jeunes?add=1',
    duration: '~1 min',
  },
  {
    key: 'firstInscription',
    label: 'Inscrire un jeune',
    description: 'Inscrivez un jeune à sa première action.',
    icon: ClipboardList,
    link: '/espace/actions',
    duration: '~1 min',
  },
]
```

### Animations
- Cercle de progression : SVG stroke-dashoffset avec transition CSS
- Panneau : slide-in avec Transition de Vue (transform translateX)
- Checkmark : CSS animation scale + fade-in
- Confetti : canvas-confetti (npm install canvas-confetti)
- Toast nudge : vue-sonner (déjà installé)

### Mobile
- Bouton flottant reste en bas à droite (plus petit)
- Panneau s'ouvre en bottom-sheet (plein écran sur mobile)
- Mini-bandeau stack verticalement

## SESSION_ID
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
