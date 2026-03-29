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

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Corps de requête invalide' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  // Verify ownership (by structure or admin)
  const { data: jeune } = await adminClient
    .from('jeunes')
    .select('prescripteur_id, structure_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) {
    throw createError({ statusCode: 404, message: 'Jeune introuvable' })
  }

  const { data: prescripteur } = await adminClient
    .from('prescripteurs')
    .select('role, structure_id')
    .eq('id', user.id)
    .single()

  const sameStructure = prescripteur?.structure_id && jeune.structure_id && prescripteur.structure_id === jeune.structure_id
  if (!sameStructure && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  // Build safe update object (only known fields)
  const updates: Record<string, unknown> = {}
  if (body.firstName !== undefined) updates.first_name = String(body.firstName)
  if (body.lastName !== undefined) updates.last_name = String(body.lastName)
  if (body.dateOfBirth !== undefined) updates.date_of_birth = String(body.dateOfBirth)
  if (body.address !== undefined) updates.address = String(body.address)
  if (body.postalCode !== undefined) updates.postal_code = String(body.postalCode)
  if (body.city !== undefined) updates.city = String(body.city)
  if (body.situation !== undefined) updates.situation = String(body.situation)
  if (body.notes !== undefined) updates.notes = String(body.notes)

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'Aucun champ à mettre à jour' })
  }

  const { data: row, error } = await adminClient
    .from('jeunes')
    .update(updates)
    .eq('id', jeuneId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return row
})
