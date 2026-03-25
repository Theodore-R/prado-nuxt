import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  const config = useRuntimeConfig()
  const adminClient = createClient(
    config.public.supabase.url,
    config.supabaseServiceRoleKey,
  )

  const [prescripteur, jeunes, inscriptions] = await Promise.all([
    adminClient.from('prescripteurs').select('*').eq('id', user.id).single(),
    adminClient.from('jeunes').select('*').eq('prescripteur_id', user.id),
    adminClient.from('inscriptions').select('*').eq('prescripteur_id', user.id),
  ])

  const exportData = {
    exportDate: new Date().toISOString(),
    account: {
      email: user.email,
      createdAt: user.created_at,
      metadata: user.user_metadata,
    },
    prescripteur: prescripteur.data,
    jeunes: jeunes.data ?? [],
    inscriptions: inscriptions.data ?? [],
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json',
    'Content-Disposition': 'attachment; filename="mes-donnees-prado.json"',
  })

  return exportData
})
