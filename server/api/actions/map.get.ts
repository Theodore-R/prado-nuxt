import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const client = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const { data, error } = await client
    .from('actions')
    .select('id, title')
    .order('id', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data ?? []
})
