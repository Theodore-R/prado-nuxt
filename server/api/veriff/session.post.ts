import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.veriffApiKey
  const baseUrl = config.veriffBaseUrl || 'https://stationapi.veriff.com'

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Veriff API key not configured' })
  }

  const body = await readBody(event)
  const { jeuneId, firstName, lastName } = body ?? {}

  if (!jeuneId) {
    throw createError({ statusCode: 400, message: 'jeuneId requis' })
  }

  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  // Verify the jeune belongs to this prescripteur
  const { data: jeune, error: jeuneError } = await adminClient
    .from('jeunes')
    .select('id, prescripteur_id')
    .eq('id', jeuneId)
    .single()

  if (jeuneError || !jeune) {
    throw createError({ statusCode: 404, message: 'Jeune introuvable' })
  }

  if (jeune.prescripteur_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Accès non autorisé' })
  }

  // Create Veriff session
  const response = await $fetch<any>(`${baseUrl}/v1/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AUTH-CLIENT': apiKey,
    },
    body: {
      verification: {
        ...(config.public.siteUrl?.startsWith('https') ? { callback: `${config.public.siteUrl}/espace/jeunes/${jeuneId}` } : {}),
        person: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
        vendorData: jeuneId,
      },
    },
  })

  if (response.status !== 'success') {
    throw createError({ statusCode: 500, message: 'Erreur lors de la création de la session Veriff' })
  }

  // Store session ID on the jeune record
  await adminClient
    .from('jeunes')
    .update({ veriff_session_id: response.verification.id })
    .eq('id', jeuneId)

  return {
    sessionUrl: response.verification.url,
    sessionId: response.verification.id,
  }
})
