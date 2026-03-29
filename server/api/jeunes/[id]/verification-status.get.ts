import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const jeuneId = getRouterParam(event, 'id')
  if (!jeuneId) {
    throw createError({ statusCode: 400, message: 'id requis' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  const { data: jeune } = await adminClient
    .from('jeunes')
    .select('prescripteur_id, identity_verified, veriff_session_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) {
    throw createError({ statusCode: 404, message: 'Jeune introuvable' })
  }

  const { data: prescripteur } = await adminClient
    .from('prescripteurs')
    .select('role')
    .eq('id', user.id)
    .single()

  if (jeune.prescripteur_id !== user.id && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  // Already verified in DB
  if (jeune.identity_verified) {
    return { identityVerified: true, verificationPending: false }
  }

  // No Veriff session → nothing pending
  if (!jeune.veriff_session_id) {
    return { identityVerified: false, verificationPending: false }
  }

  // Session exists but not yet verified — check Veriff API for decision
  if (config.veriffApiKey) {
    const baseUrl = config.veriffBaseUrl || 'https://stationapi.veriff.com'
    try {
      const decision = await $fetch<{ verification?: { code: number; status: string } }>(
        `${baseUrl}/v1/sessions/${jeune.veriff_session_id}/decision`,
        {
          headers: {
            'X-AUTH-CLIENT': config.veriffApiKey,
            'Content-Type': 'application/json',
          },
        },
      )

      if (decision.verification?.code === 9001) {
        // Approved — update DB
        await adminClient
          .from('jeunes')
          .update({ identity_verified: true })
          .eq('id', jeuneId)
          .eq('veriff_session_id', jeune.veriff_session_id)

        return { identityVerified: true, verificationPending: false }
      }

      // Declined (9102) or expired (9104) — not pending anymore
      if (decision.verification?.code === 9102 || decision.verification?.code === 9104) {
        return { identityVerified: false, verificationPending: false }
      }
    } catch {
      // Veriff API error or session not yet decided — assume still pending
    }
  }

  // Session exists, no decision yet → pending
  return { identityVerified: false, verificationPending: true }
})
