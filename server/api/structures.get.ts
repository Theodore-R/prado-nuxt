import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const { data, error } = await supabase
    .from('structures')
    .select('id, name')
    .order('name')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data ?? []
})
