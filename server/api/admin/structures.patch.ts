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
  const name = typeof body?.name === 'string' ? body.name.trim() : ''

  if (!id || !name) {
    throw createError({ statusCode: 400, message: 'id et name requis' })
  }

  const { data, error } = await supabase
    .from('structures')
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw createError({ statusCode: 409, message: 'Ce nom de structure existe deja' })
    }
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
