import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)
  const body = await readBody(event)
  const { id, places_max, archived_at } = body ?? {}

  if (!id) {
    throw createError({ statusCode: 400, message: 'id requis' })
  }

  const updates: Record<string, unknown> = {}

  // Handle places_max update
  if (places_max !== undefined) {
    if (places_max !== null && (typeof places_max !== 'number' || places_max < 0)) {
      throw createError({ statusCode: 400, message: 'places_max doit être un nombre positif ou null' })
    }
    updates.places_max = places_max ?? null
  }

  // Handle archived_at update
  if (archived_at !== undefined) {
    updates.archived_at = archived_at
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'Aucune modification' })
  }

  const { error } = await adminClient
    .from('actions')
    .update(updates)
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { success: true }
})
