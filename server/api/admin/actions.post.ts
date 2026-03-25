import { requireAdmin } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  const adminClient = await requireAdmin(event)
  const body = await readBody(event)
  const { sourceId } = body ?? {}

  if (!sourceId) {
    throw createError({ statusCode: 400, message: 'sourceId requis' })
  }

  // Fetch the source action
  const { data: source, error: fetchError } = await adminClient
    .from('actions')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (fetchError || !source) {
    throw createError({ statusCode: 404, message: 'Action source introuvable' })
  }

  // Clone the action with a new title, unpublished by default
  const { id: _id, created_at: _created, ...rest } = source
  const { data: cloned, error: insertError } = await adminClient
    .from('actions')
    .insert({
      ...rest,
      title: `${source.title} (copie)`,
      is_published: false,
    })
    .select()
    .single()

  if (insertError) throw createError({ statusCode: 500, message: insertError.message })

  return cloned
})
