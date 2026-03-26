/**
 * Onboarding state management.
 * Tracks which steps the user has completed post-registration.
 * Persists to localStorage for cross-session continuity.
 */
const STORAGE_KEY = 'prado-onboarding'

interface OnboardingState {
  accountCreated: boolean
  profileCompleted: boolean
  catalogVisited: boolean
  firstJeuneAdded: boolean
  firstInscription: boolean
}

export interface OnboardingStepConfig {
  key: keyof OnboardingState
  label: string
  description: string
  link: string | null
  duration: string | null
  done: boolean
}

const defaultState: OnboardingState = {
  accountCreated: false,
  profileCompleted: false,
  catalogVisited: false,
  firstJeuneAdded: false,
  firstInscription: false,
}

export function useOnboarding() {
  const state = useState<OnboardingState>('onboarding', () => ({ ...defaultState }))
  const dismissed = useState<boolean>('onboarding-dismissed', () => false)
  const panelOpen = useState<boolean>('onboarding-panel', () => false)

  function loadFromStorage() {
    if (import.meta.server) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingState>
        state.value = { ...defaultState, ...parsed }
      }
      const dismissedRaw = localStorage.getItem(`${STORAGE_KEY}-dismissed`)
      if (dismissedRaw === 'true') dismissed.value = true
    } catch { /* ignore */ }
  }

  function saveToStorage() {
    if (import.meta.server) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  function complete(step: keyof OnboardingState) {
    if (state.value[step]) return
    state.value = { ...state.value, [step]: true }
    saveToStorage()
    return true // returns true if step was newly completed
  }

  function dismiss() {
    dismissed.value = true
    if (!import.meta.server) localStorage.setItem(`${STORAGE_KEY}-dismissed`, 'true')
  }

  function openPanel() { panelOpen.value = true }
  function closePanel() { panelOpen.value = false }

  /** Sync onboarding state with actual data (user, jeunes, inscriptions) */
  function syncWithData(opts: { hasUser: boolean, hasProfile: boolean, jeunesCount: number, inscriptionsCount: number }) {
    let changed = false
    if (opts.hasUser && !state.value.accountCreated) { state.value = { ...state.value, accountCreated: true }; changed = true }
    if (opts.hasProfile && !state.value.profileCompleted) { state.value = { ...state.value, profileCompleted: true }; changed = true }
    if (opts.jeunesCount > 0 && !state.value.firstJeuneAdded) { state.value = { ...state.value, firstJeuneAdded: true }; changed = true }
    if (opts.inscriptionsCount > 0 && !state.value.firstInscription) { state.value = { ...state.value, firstInscription: true }; changed = true }
    if (changed) saveToStorage()
  }

  function reset() {
    state.value = { ...defaultState }
    dismissed.value = false
    if (!import.meta.server) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(`${STORAGE_KEY}-dismissed`)
    }
  }

  const completedCount = computed(() =>
    Object.values(state.value).filter(Boolean).length,
  )

  const totalSteps = computed(() => Object.keys(state.value).length)

  const progress = computed(() =>
    Math.round((completedCount.value / totalSteps.value) * 100),
  )

  const isComplete = computed(() => completedCount.value === totalSteps.value)

  const showWidget = computed(() => !isComplete.value && !dismissed.value)

  const steps = computed<OnboardingStepConfig[]>(() => [
    {
      key: 'accountCreated',
      label: 'Créer votre compte',
      description: 'Votre compte a été créé avec succès.',
      link: null,
      duration: null,
      done: state.value.accountCreated,
    },
    {
      key: 'profileCompleted',
      label: 'Compléter votre profil',
      description: 'Renseignez votre fonction et votre structure.',
      link: '/espace/parametres',
      duration: '~1 min',
      done: state.value.profileCompleted,
    },
    {
      key: 'catalogVisited',
      label: 'Parcourir le catalogue',
      description: 'Découvrez les actions disponibles pour vos jeunes.',
      link: '/espace/actions',
      duration: '~2 min',
      done: state.value.catalogVisited,
    },
    {
      key: 'firstJeuneAdded',
      label: 'Ajouter un jeune',
      description: 'Créez une fiche pour votre premier jeune.',
      link: '/espace/jeunes?add=1',
      duration: '~1 min',
      done: state.value.firstJeuneAdded,
    },
    {
      key: 'firstInscription',
      label: 'Inscrire un jeune',
      description: 'Inscrivez un jeune à sa première action.',
      link: '/espace/actions',
      duration: '~1 min',
      done: state.value.firstInscription,
    },
  ])

  const nextStep = computed(() => steps.value.find(s => !s.done) ?? null)

  return {
    state,
    steps,
    nextStep,
    completedCount,
    totalSteps,
    progress,
    isComplete,
    showWidget,
    panelOpen,
    complete,
    dismiss,
    openPanel,
    closePanel,
    reset,
    loadFromStorage,
    syncWithData,
  }
}
