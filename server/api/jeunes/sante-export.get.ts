import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'
import { toJeuneSante } from '~/lib/types/sante'
import type { JeuneSante } from '~/lib/types/sante'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifié' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Get all jeune IDs owned by this prescripteur
  const { data: jeunes } = await supabase
    .from('jeunes')
    .select('id')
    .eq('prescripteur_id', user.id)

  if (!jeunes || jeunes.length === 0) return {}

  const jeuneIds = jeunes.map(j => j.id)

  // Fetch all sante records for these jeunes
  const { data, error } = await supabase
    .from('jeune_sante')
    .select('*')
    .in('jeune_id', jeuneIds)

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Return as a map: jeuneId → JeuneSante
  const result: Record<string, JeuneSante> = {}
  for (const row of data ?? []) {
    result[row.jeune_id] = toJeuneSante(row)
  }

  return result
})
