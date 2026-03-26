import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import { toJeuneSante } from '~/lib/types/sante'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const jeuneId = getRouterParam(event, 'id')
  if (!jeuneId) throw createError({ statusCode: 400, message: 'id requis' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Verify ownership
  const { data: jeune } = await supabase
    .from('jeunes')
    .select('prescripteur_id')
    .eq('id', jeuneId)
    .single()

  if (!jeune) throw createError({ statusCode: 404, message: 'Jeune introuvable' })

  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role')
    .eq('id', user.id)
    .single()

  if (jeune.prescripteur_id !== user.id && prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('jeune_sante')
    .select('*')
    .eq('jeune_id', jeuneId)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!data) return null

  return toJeuneSante(data)
})
