import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const body = await readBody(event)
  const { name, structure, fonction, phone } = body

  if (!name || !structure) {
    throw createError({ statusCode: 400, message: 'Nom et structure requis' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  // Update prescripteurs table
  const { error } = await adminClient
    .from('prescripteurs')
    .update({ name, structure, phone: phone ?? '' })
    .eq('id', user.id)

  if (error) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la mise a jour du profil' })
  }

  // Update user metadata
  await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { name, structure, fonction: fonction ?? '', phone: phone ?? '' },
  })

  return { success: true }
})
