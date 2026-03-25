import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { email } = await readBody<{ email: string }>(event)

  if (!email || typeof email !== 'string') {
    throw createError({ statusCode: 400, message: 'Email requis' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Query prescripteurs table (linked to auth.users) by email
  const { data } = await adminClient
    .from('prescripteurs')
    .select('id')
    .eq('professional_email', email.toLowerCase())
    .limit(1)
    .maybeSingle()

  return { exists: !!data }
})
