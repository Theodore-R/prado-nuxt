import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const { data, error } = await adminClient
    .from('jeunes')
    .select('*, prescripteurs(name), inscriptions(id)')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data ?? []).map(j => ({
    id: j.id,
    first_name: j.first_name,
    last_name: j.last_name,
    date_of_birth: j.date_of_birth,
    situation: j.situation,
    created_at: j.created_at,
    prescripteur_name: (j.prescripteurs as { name: string } | null)?.name ?? null,
    inscriptions_count: Array.isArray(j.inscriptions) ? j.inscriptions.length : 0,
  }))
})
