import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface OnboardingStep {
  /** Unique key for this step */
  key: string
  /** Display label */
  label: string
  /** Description text */
  description: string
}

export interface UseOnboardingOptions {
  /** Array of step definitions */
  steps: OnboardingStep[]
  /** localStorage key for persisting state */
  storageKey: string
}

export interface UseOnboardingReturn {
  /** Set of completed step keys */
  state: Ref<Set<string>>
  /** Progress percentage (0-100) */
  progress: ComputedRef<number>
  /** Mark a step as completed */
  complete: (stepKey: string) => void
  /** Reset all progress */
  reset: () => void
  /** Whether all steps are completed */
  isComplete: ComputedRef<boolean>
  /** Step definitions with completion status */
  stepsWithStatus: ComputedRef<Array<OnboardingStep & { done: boolean }>>
  /** Next incomplete step, or null */
  nextStep: ComputedRef<(OnboardingStep & { done: boolean }) | null>
  /** Number of completed steps */
  completedCount: ComputedRef<number>
  /** Total number of steps */
  totalSteps: number
}

/**
 * Generic onboarding flow composable.
 * Manages step completion state with localStorage persistence.
 *
 * Usage:
 * ```ts
 * const { state, progress, complete, isComplete, stepsWithStatus } = useOnboarding({
 *   steps: [
 *     { key: 'welcome', label: 'Welcome', description: 'Get started' },
 *     { key: 'profile', label: 'Profile', description: 'Complete your profile' },
 *   ],
 *   storageKey: 'my-app-onboarding',
 * })
 * complete('welcome')
 * ```
 */
export function useOnboarding(options: UseOnboardingOptions): UseOnboardingReturn {
  const { steps, storageKey } = options
  const totalSteps = steps.length

  const state = ref<Set<string>>(new Set())

  // Load from localStorage
  function loadFromStorage(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return new Set()
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Only keep keys that match our step definitions
        const validKeys = new Set(steps.map((s) => s.key))
        return new Set(parsed.filter((k: unknown) => typeof k === 'string' && validKeys.has(k)))
      }
    } catch {
      // Corrupted data
    }
    return new Set()
  }

  function saveToStorage(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(storageKey, JSON.stringify([...state.value]))
    } catch {
      // Storage unavailable
    }
  }

  // Initialize
  if (typeof window !== 'undefined') {
    state.value = loadFromStorage()
  }

  const completedCount = computed(() => state.value.size)

  const progress = computed(() => {
    if (totalSteps === 0) return 100
    return Math.round((state.value.size / totalSteps) * 100)
  })

  const isComplete = computed(() => state.value.size >= totalSteps)

  const stepsWithStatus = computed(() =>
    steps.map((step) => ({
      ...step,
      done: state.value.has(step.key),
    })),
  )

  const nextStep = computed(() =>
    stepsWithStatus.value.find((s) => !s.done) ?? null,
  )

  function complete(stepKey: string): void {
    if (state.value.has(stepKey)) return
    // Immutable update: create new Set
    state.value = new Set([...state.value, stepKey])
    saveToStorage()
  }

  function reset(): void {
    state.value = new Set()
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore
      }
    }
  }

  return {
    state,
    progress,
    complete,
    reset,
    isComplete,
    stepsWithStatus,
    nextStep,
    completedCount,
    totalSteps,
  }
}
