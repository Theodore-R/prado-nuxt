import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // Verify cron secret (Vercel Cron sends this header)
  const authHeader = getHeader(event, 'authorization')
  const config = useRuntimeConfig()

  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const client = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const today = new Date().toISOString().split('T')[0]

  // Archive actions whose date has passed and are not already archived
  // Only archive "activite" type actions (scheduled ones with actual dates)
  const { data, error } = await client
    .from('actions')
    .update({ archived_at: new Date().toISOString() })
    .eq('is_activite', true)
    .is('archived_at', null)
    .lt('date', today)
    .select('id, title')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    archived: data?.length ?? 0,
    actions: data?.map(a => a.title) ?? [],
  }
})
