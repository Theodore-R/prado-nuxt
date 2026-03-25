import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)
  const body = await readBody(event)
  const { id, status } = body ?? {}

  if (!id || !['approved', 'rejected'].includes(status)) {
    throw createError({ statusCode: 400, message: 'id et status (approved|rejected) requis' })
  }

  const { error } = await adminClient
    .from('prescripteurs')
    .update({ status })
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
