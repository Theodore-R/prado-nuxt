import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id requis' })

  const config = useRuntimeConfig()
  const client = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const { data: action, error } = await client
    .from('actions')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !action) throw createError({ statusCode: 404, message: 'Action introuvable' })

  const { count } = await client
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('action_id', id)
    .is('canceled_at', null)

  const placesMax = typeof action.places_max === 'number' ? action.places_max : null
  const inscriptionsCount = count ?? 0
  const placesRemaining = placesMax === null ? null : Math.max(placesMax - inscriptionsCount, 0)

  return {
    ...action,
    inscriptionsCount,
    placesRemaining,
  }
})
