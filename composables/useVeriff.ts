export function useVeriff() {
  const verifying = ref(false)
  const error = ref<string | null>(null)
  const status = ref<'idle' | 'started' | 'submitted' | 'finished' | 'canceled'>('idle')

  let pollInterval: ReturnType<typeof setInterval> | null = null
  let pollCount = 0
  const MAX_POLLS = 24 // 24 × 5s = 2 minutes

  const onVerifiedCallback = ref<(() => void) | null>(null)

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    pollCount = 0
  }

  function startPolling(jeuneId: string) {
    stopPolling()
    pollInterval = setInterval(async () => {
      pollCount++
      if (pollCount > MAX_POLLS) {
        stopPolling()
        return
      }
      try {
        const result = await $fetch<{ identityVerified: boolean }>(`/api/jeunes/${jeuneId}/verification-status`)
        if (result.identityVerified) {
          stopPolling()
          status.value = 'finished'
          onVerifiedCallback.value?.()
        }
      } catch {
        // Silently continue polling on error
      }
    }, 5000)
  }

  const startVerification = async (jeuneId: string, firstName?: string, lastName?: string) => {
    verifying.value = true
    error.value = null
    status.value = 'idle'

    try {
      // Create session server-side, linked to the jeune
      const session = await $fetch<{ sessionUrl: string; sessionId: string }>('/api/veriff/session', {
        method: 'POST',
        body: { jeuneId, firstName, lastName },
      })

      // Dynamically import Veriff InContext SDK (client-side only)
      const { createVeriffFrame, MESSAGES } = await import('@veriff/incontext-sdk')

      createVeriffFrame({
        url: session.sessionUrl,
        onEvent: (msg: string) => {
          switch (msg) {
            case MESSAGES.STARTED:
              status.value = 'started'
              break
            case MESSAGES.SUBMITTED:
              status.value = 'submitted'
              startPolling(jeuneId)
              break
            case MESSAGES.FINISHED:
              status.value = 'finished'
              verifying.value = false
              if (!pollInterval) startPolling(jeuneId)
              break
            case MESSAGES.CANCELED:
              status.value = 'canceled'
              verifying.value = false
              stopPolling()
              break
          }
        },
      })
    } catch (err: any) {
      error.value = err.data?.message ?? 'Erreur lors du lancement de la vérification'
      verifying.value = false
    }
  }

  const reset = () => {
    verifying.value = false
    error.value = null
    status.value = 'idle'
    stopPolling()
  }

  // Check if a verification is pending (e.g. on page load after refresh)
  const checkPending = async (jeuneId: string) => {
    try {
      const result = await $fetch<{ identityVerified: boolean; verificationPending: boolean }>(`/api/jeunes/${jeuneId}/verification-status`)
      if (result.identityVerified) {
        status.value = 'finished'
        onVerifiedCallback.value?.()
      } else if (result.verificationPending) {
        status.value = 'submitted'
        startPolling(jeuneId)
      }
    } catch {
      // Silent
    }
  }

  if (import.meta.client) {
    onUnmounted(() => stopPolling())
  }

  return {
    verifying,
    error,
    status,
    startVerification,
    reset,
    checkPending,
    onVerified: (cb: () => void) => { onVerifiedCallback.value = cb },
  }
}
