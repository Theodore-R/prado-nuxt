import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const body = await readBody(event)
  const { confirmEmail } = body

  if (typeof confirmEmail !== 'string' || confirmEmail.trim() === '' || confirmEmail !== user.email) {
    throw createError({ statusCode: 400, message: 'L\'email de confirmation ne correspond pas' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  // Delete inscriptions
  const { error: err1 } = await adminClient
    .from('inscriptions')
    .delete()
    .eq('prescripteur_id', user.id)
  if (err1) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la suppression des inscriptions' })
  }

  // Delete jeunes
  const { error: err2 } = await adminClient
    .from('jeunes')
    .delete()
    .eq('prescripteur_id', user.id)
  if (err2) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la suppression des jeunes' })
  }

  // Delete prescripteur row
  const { error: err3 } = await adminClient
    .from('prescripteurs')
    .delete()
    .eq('id', user.id)
  if (err3) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la suppression du profil' })
  }

  // Delete auth user (last — data must be cleaned first)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) {
    throw createError({ statusCode: 500, message: 'Erreur lors de la suppression du compte' })
  }

  return { success: true }
})
