import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const jeuneId = getRouterParam(event, 'id')
  if (!jeuneId) throw createError({ statusCode: 400, message: 'id requis' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Verify ownership (by structure or admin)
  const { data: jeune } = await supabase
    .from('jeunes')
    .select('prescripteur_id, structure_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) throw createError({ statusCode: 404, message: 'Jeune introuvable' })

  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role, structure_id')
    .eq('id', user.id)
    .single()

  const sameStructure = prescripteur?.structure_id && jeune.structure_id && prescripteur.structure_id === jeune.structure_id
  if (!sameStructure && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const { error } = await supabase
    .from('jeune_sante')
    .delete()
    .eq('jeune_id', jeuneId)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
