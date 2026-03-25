import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)

  const { data, error } = await adminClient
    .from('prescripteurs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data ?? []
})
