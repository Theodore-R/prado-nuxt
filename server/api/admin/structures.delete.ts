import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifie' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role')
    .eq('id', user.id)
    .single()

  if (prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acces refuse' })
  }

  const body = await readBody(event)
  const id = typeof body?.id === 'string' ? body.id : ''

  if (!id) {
    throw createError({ statusCode: 400, message: 'id requis' })
  }

  // Check if any prescripteurs are attached
  const { count } = await supabase
    .from('prescripteurs')
    .select('*', { count: 'exact', head: true })
    .eq('structure_id', id)

  if ((count ?? 0) > 0) {
    throw createError({ statusCode: 409, message: 'Impossible de supprimer : des prescripteurs sont rattaches a cette structure' })
  }

  const { error } = await supabase
    .from('structures')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
