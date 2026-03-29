import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Non authentifie' })

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceRoleKey)

  // Check admin role
  const { data: prescripteur } = await supabase
    .from('prescripteurs')
    .select('role')
    .eq('id', user.id)
    .single()

  if (prescripteur?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Acces refuse' })
  }

  // Fetch structures with counts
  const { data: structures, error } = await supabase
    .from('structures')
    .select('id, name, created_at')
    .order('name')

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Get prescripteur and jeune counts per structure
  const [prescripteursResult, jeunesResult] = await Promise.all([
    supabase.from('prescripteurs').select('structure_id'),
    supabase.from('jeunes').select('structure_id'),
  ])

  const prescripteurCounts = new Map<string, number>()
  for (const row of prescripteursResult.data ?? []) {
    if (row.structure_id) {
      prescripteurCounts.set(row.structure_id, (prescripteurCounts.get(row.structure_id) ?? 0) + 1)
    }
  }

  const jeuneCounts = new Map<string, number>()
  for (const row of jeunesResult.data ?? []) {
    if (row.structure_id) {
      jeuneCounts.set(row.structure_id, (jeuneCounts.get(row.structure_id) ?? 0) + 1)
    }
  }

  return (structures ?? []).map(s => ({
    ...s,
    prescripteurs_count: prescripteurCounts.get(s.id) ?? 0,
    jeunes_count: jeuneCounts.get(s.id) ?? 0,
  }))
})
