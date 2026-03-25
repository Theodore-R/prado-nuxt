import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const { data, error } = await adminClient
    .from('inscriptions')
    .select('*, jeunes(first_name, last_name), prescripteurs(name, professional_email)')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data ?? []
})
